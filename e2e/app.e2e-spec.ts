import { LocalBeatsPage } from './app.po';

describe('LocalBeats App', () => {
  let page: LocalBeatsPage;

  beforeEach(() => {
    page = new LocalBeatsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
