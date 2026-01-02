import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class DocumentService {



   constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  getDocument(): Document | null {
    if (isPlatformBrowser(this.platformId)) {
      return document;
    }
    return null; 
  }
}
