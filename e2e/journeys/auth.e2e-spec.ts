import { browser } from 'protractor';
import { TwigPage } from '../PageObjects/app.po';

describe('logging in', () => {
  let page: TwigPage;
  const twigletName = 'Test Twiglet';
  const modelName = 'Test Model';
  beforeAll(() => {
    page = new TwigPage();
    page.navigateTo();
  });

  it('can login', () => {
    page.user.login('ben.hernandez@corp.riglet.io', 'Z3nB@rnH3n');
    expect(page.user.isLoggedIn).toBeTruthy();
  });

  it('can logout', () => {
    page.user.logout();
    expect(page.user.isLoggedIn).toBeFalsy();
  });
});
