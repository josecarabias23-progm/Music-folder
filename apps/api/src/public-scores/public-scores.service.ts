import { Injectable, Logger } from '@nestjs/common';
import { get as httpGet } from 'http';
import { get as httpsGet } from 'https';
import { SheetsService } from '../sheets/sheets.service';

export interface PublicScore {
  title: string;
  composer?: string;
  instrumentation?: string;
  pdfUrl?: string | null;
  sourceUrl: string;
}

@Injectable()
export class PublicScoresService {
  private readonly logger = new Logger(PublicScoresService.name);

  constructor(private readonly sheetsService: SheetsService) {}

  private async fetchUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const getter = url.startsWith('https') ? httpsGet : httpGet;
      getter(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      }).on('error', (err) => reject(err));
    });
  }

  async searchIMSLP(query: string, limit = 10): Promise<PublicScore[]> {
    const q = encodeURIComponent(query);
    const searchUrl = `https://imslp.org/index.php?title=Special:Search&search=${q}`;
    this.logger.log(`Searching IMSLP: ${searchUrl}`);
    const html = await this.fetchUrl(searchUrl);

    const results: PublicScore[] = [];

    const itemRegex = /<div class="mw-search-result-heading">[\s\S]*?<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = itemRegex.exec(html)) && results.length < limit) {
      const relPath = m[1];
      const title = m[2].replace(/<[^>]+>/g, '').trim();
      const pageUrl = `https://imslp.org${relPath}`;

      // fetch the page and try to find a .pdf link
      try {
        const pageHtml = await this.fetchUrl(pageUrl);
        // Look for direct PDF links
        const pdfRegex = /href="(https?:\/\/[^\"]+?\.pdf)"/gi;
        const pdfMatch = pdfRegex.exec(pageHtml);
        let pdfUrl: string | null = null;
        if (pdfMatch) pdfUrl = pdfMatch[1];

        // Try to extract composer/instrumentation from simple metadata
        let composer = null;
        const composerMatch = /<span[^>]*>Composed by:<\/span>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i.exec(pageHtml);
        if (composerMatch) composer = composerMatch[1].trim();

        results.push({ title, composer: composer || undefined, instrumentation: undefined, pdfUrl, sourceUrl: pageUrl });
      } catch (err) {
        this.logger.warn(`Failed to fetch page ${pageUrl}: ${err}`);
        results.push({ title, sourceUrl: pageUrl });
      }
    }

    return results;
  }

  async importPublicScore(payload: { title: string; composer?: string; pdfUrl?: string; sourceUrl?: string; instrumentation?: string }) {
    const created = await this.sheetsService.create({ title: payload.title, composer: payload.composer, ensemble: payload.instrumentation, type: 'pdf' });
    // attach external URL as file_url if present
    if (payload.pdfUrl || payload.sourceUrl) {
      const fileRef = payload.pdfUrl || payload.sourceUrl || '';
      // attachFile will store this string to file_url
      await this.sheetsService.attachFile(created.id, fileRef, 0, 'pdf');
    }
    return created;
  }
}
