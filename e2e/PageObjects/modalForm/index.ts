import { browser, element, by, Key, ElementFinder, ElementArrayFinder } from 'protractor';

const modalPath = `//ngb-modal-window[@class='modal fade show']`;
const modalNotOpenError = new Error('Modal not open');
export class ModalForm {

  /**
   * Gets the parent div of a label, used to quickly navigate around .form-groups
   *
   * @private
   * @param {any} labelText the text of the label
   * @returns {ElementFinder}
   *
   * @memberOf ModalForm
   */
  private getParentOfLabel(labelText): ElementFinder {
    return element(by.xpath(`${modalPath}//form//label[contains(text(), "${labelText}")]/parent::*`));
  }

  /**
   * Throws an error if the modal is not open. Better than thinking we are missing a specific element.
   *
   * @private
   *
   * @memberOf ModalForm
   */
  private throwIfNotOpen(): void {
    if (!this.isModalOpen) {
      throw modalNotOpenError;
    }
  }

  /**
   * Checks to see if any modal is open.
   *
   * @readonly
   * @type {PromiseLike<boolean>}
   * @memberOf ModalForm
   */
  get isModalOpen(): PromiseLike<boolean>{
    return browser.isElementPresent(element(by.css('.modal:not(.modalTop)')));
  }

  /**
   * Returns a promise containing the modal title.
   *
   * @readonly
   * @type {PromiseLike<string>}
   * @memberOf ModalForm
   */
  get modalTitle(): PromiseLike<string> {
    this.throwIfNotOpen();
    return element(by.xpath(`${modalPath}//div[@class='modal-header']/h4[@class='modal-title']`)).getText();
  }

  /**
   * Returns a promise containing the number of errors currently on the form.
   *
   * @readonly
   * @type {PromiseLike<number>}
   * @memberOf ModalForm
   */
  get formErrorCount(): PromiseLike<number> {
    this.throwIfNotOpen();
    return element(by.xpath(modalPath)).all(by.className('alert-danger')).count();
  }

  /**
   * Returns a promise containing the text of the error under that label, or undefined if none
   *
   * @param {any} labelText the text of the label, fuzzy finding but case sensitive
   * @returns {PromiseLike<string>}
   *
   * @memberOf ModalForm
   */
  getErrorByLabel(labelText): PromiseLike<string> {
    this.throwIfNotOpen();
    const parent = this.getParentOfLabel(labelText);
    return browser.isElementPresent(parent.$('.alert-danger')).then(present => {
      if (present) {
        return parent.$('.alert-danger').getText();
      }
    });
  }

  /**
   * Returns a promise containing a boolean representing the enabled state of the button
   *
   * @param {any} buttonText
   * @returns {PromiseLike<boolean>}
   *
   * @memberOf ModalForm
   */
  checkIfButtonEnabled(buttonText): PromiseLike<boolean> {
    this.throwIfNotOpen();
    const modal = element(by.xpath(modalPath));
    return modal.element(by.buttonText(buttonText)).isEnabled();
  }

  /**
   * Fills in a text field by the label name (Case Sensative).
   *
   * @param {any} labelText the text of the label, fuzzy finding but case sensitive
   * @param {any} value the value to be placed in the text field
   *
   * @memberOf ModalForm
   */
  fillInTextFieldByLabel(labelText, value): void {
    this.throwIfNotOpen();
    const parent = this.getParentOfLabel(labelText);
    const input = parent.$('input');
    input.clear();
    input.sendKeys(value);
  }

  /**
   * Fills in the text field based on ngModel attribute.
   *
   * @param {any} ngModel
   * @param {any} value
   *
   * @memberOf ModalForm
   */
  fillInOnlyTextField(value): void {
    this.throwIfNotOpen();
    const self = element(by.xpath(modalPath));
    const input = self.element(by.css('input[type="text"]'));
    input.clear();
    input.sendKeys(value);
  }

  /**
   * Passes an 'a' then backspaces over it to simulate the user leaving the field empty.
   *
   * @param {any} labelText the text of the label, fuzzy finding but case sensitive
   *
   * @memberOf ModalForm
   */
  makeInputFieldDirtyByLabel(labelText): void {
    this.throwIfNotOpen();
    const parent = this.getParentOfLabel(labelText);
    const input = parent.$('input');
    input.clear();
    input.sendKeys('a');
    input.sendKeys(Key.BACK_SPACE);
  }

  /**
   * Selects an option from a <select> by label text
   *
   * @param {any} labelText the text of the label, fuzzy finding but case sensitive
   * @param {any} optionText the text of the option to be selected.
   *
   * @memberOf ModalForm
   */
  selectOptionByLabel(labelText, optionText): void {
    this.throwIfNotOpen();
    const parent = this.getParentOfLabel(labelText);
    const options: ElementArrayFinder = parent.$('select').all(by.tagName('option'));
    options.filter((option: ElementFinder) => option.getText().then(text => text === optionText))
    .then(arrayOfOneOption => arrayOfOneOption[0].click());
  }

  makeSelectDirtyByLabel(labelText): void {
    this.throwIfNotOpen();
    const parent = this.getParentOfLabel(labelText);
    const options = parent.$('select').all(by.tagName('option'));
    options.get(1).click();
    options.get(0).click();
  }

  /**
   * Clicks a button specified by the button text
   *
   * @param {any} buttonText the button text to look for.
   *
   * @memberOf ModalForm
   */
  clickButton(buttonText): void {
    this.throwIfNotOpen();
    const modal = element(by.xpath(modalPath));
    modal.element(by.buttonText(buttonText)).click();
  }
};
