import { TestBed, inject } from '@angular/core/testing';

import { SpotifyClientService } from './spotify-client.service';

describe('SpotifyClientService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpotifyClientService]
    });
  });

  it('should be created', inject([SpotifyClientService], (service: SpotifyClientService) => {
    expect(service).toBeTruthy();
  }));
});
