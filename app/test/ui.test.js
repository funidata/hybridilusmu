const assert = require("assert");
const { stylizeRegisterButtons } = require("../src/ui/customBlocks");

const officeOne = {
  id: 1,
  officeName: "Helsinki",
  officeEmoji: ":cityscape:",
};
const officeTwo = {
  id: 2,
  officeName: "Tampere",
  officeEmoji: ":city_sunset:",
};

const assertButtonStyling = (result, expected, confirmNotNull) => {
  assert.strictEqual(result.officeButtonColor, expected.officeButtonColor);
  assert.strictEqual(result.remoteButtonColor, expected.remoteButtonColor);
  assert.strictEqual(result.emojis.registrationEmoji, expected.emojis.registrationEmoji);
  assert.strictEqual(result.emojis.officeEmoji, expected.emojis.officeEmoji);
  confirmNotNull
    ? assert.notStrictEqual(result.confirm, null)
    : assert.strictEqual(result.confirm, expected.confirm);
};

describe("registration buttons stylizing logic", () => {
  let registration = null;
  let defaultRegistration = null;
  let selectedOffice = null;

  beforeEach(() => {
    registration = null;
    defaultRegistration = null;
    selectedOffice = officeOne;
  });

  it("normal office registration to selected office and no default registration", () => {
    registration = { status: true, officeId: officeOne.id, ...officeOne };
    const result = stylizeRegisterButtons(registration, defaultRegistration, selectedOffice);
    const expectedResult = {
      officeButtonColor: "primary",
      remoteButtonColor: null,
      emojis: { registrationEmoji: "normal", officeEmoji: null },
      confirm: null,
    };
    assertButtonStyling(result, expectedResult);
  });

  it("normal remote registration to selected office and no default registration", () => {
    registration = { status: false, officeId: officeOne.id, ...officeOne };
    const result = stylizeRegisterButtons(registration, defaultRegistration, selectedOffice);
    const expectedResult = {
      officeButtonColor: null,
      remoteButtonColor: "primary",
      emojis: { registrationEmoji: "normal", officeEmoji: null },
      confirm: null,
    };
    assertButtonStyling(result, expectedResult);
  });

  it("normal office registration to another office and no default registration", () => {
    registration = { status: true, officeId: officeTwo.id, ...officeTwo };
    const result = stylizeRegisterButtons(registration, defaultRegistration, selectedOffice);
    const expectedResult = {
      officeButtonColor: "danger",
      remoteButtonColor: null,
      emojis: { registrationEmoji: "normal", officeEmoji: officeTwo.officeEmoji },
      confirm: {},
    };
    assertButtonStyling(result, expectedResult, true);
  });

  it("normal remote registration to another office and no default registration", () => {
    registration = { status: false, officeId: officeTwo.id, ...officeTwo };
    const result = stylizeRegisterButtons(registration, defaultRegistration, selectedOffice);
    const expectedResult = {
      officeButtonColor: null,
      remoteButtonColor: "danger",
      emojis: { registrationEmoji: "normal", officeEmoji: officeTwo.officeEmoji },
      confirm: {},
    };
    assertButtonStyling(result, expectedResult, true);
  });

  it("default office registration to selected office", () => {
    defaultRegistration = { status: true, officeId: officeOne.id, ...officeOne };
    const result = stylizeRegisterButtons(registration, defaultRegistration, selectedOffice);
    const expectedResult = {
      officeButtonColor: "primary",
      remoteButtonColor: null,
      emojis: { registrationEmoji: "default", officeEmoji: null },
      confirm: null,
    };
    assertButtonStyling(result, expectedResult);
  });

  it("default remote registration to selected office", () => {
    defaultRegistration = { status: false, officeId: officeOne.id, ...officeOne };
    const result = stylizeRegisterButtons(registration, defaultRegistration, selectedOffice);
    const expectedResult = {
      officeButtonColor: null,
      remoteButtonColor: "primary",
      emojis: { registrationEmoji: "default", officeEmoji: null },
      confirm: null,
    };
    assertButtonStyling(result, expectedResult);
  });

  it("default office registration to another office", () => {
    defaultRegistration = { status: true, officeId: officeTwo.id, ...officeTwo };
    const result = stylizeRegisterButtons(registration, defaultRegistration, selectedOffice);
    const expectedResult = {
      officeButtonColor: "danger",
      remoteButtonColor: null,
      emojis: { registrationEmoji: "default", officeEmoji: officeTwo.officeEmoji },
      confirm: {},
    };
    assertButtonStyling(result, expectedResult, true);
  });

  it("default remote registration to another office", () => {
    defaultRegistration = { status: false, officeId: officeTwo.id, ...officeTwo };
    const result = stylizeRegisterButtons(registration, defaultRegistration, selectedOffice);
    const expectedResult = {
      officeButtonColor: null,
      remoteButtonColor: "danger",
      emojis: { registrationEmoji: "default", officeEmoji: officeTwo.officeEmoji },
      confirm: {},
    };
    assertButtonStyling(result, expectedResult, true);
  });

  it("normal office registration to selected office with default office registration to another office", () => {
    registration = { status: true, officeId: officeOne.id, ...officeOne };
    defaultRegistration = { status: true, officeId: officeTwo.id, ...officeTwo };
    const result = stylizeRegisterButtons(registration, defaultRegistration, selectedOffice);
    const expectedResult = {
      officeButtonColor: "primary",
      remoteButtonColor: null,
      emojis: { registrationEmoji: "normal", officeEmoji: null },
      confirm: null,
    };
    assertButtonStyling(result, expectedResult);
  });

  it("normal remote registration to selected office with default office registration to another office", () => {
    registration = { status: false, officeId: officeOne.id, ...officeOne };
    defaultRegistration = { status: true, officeId: officeTwo.id, ...officeTwo };
    const result = stylizeRegisterButtons(registration, defaultRegistration, selectedOffice);
    const expectedResult = {
      officeButtonColor: null,
      remoteButtonColor: "primary",
      emojis: { registrationEmoji: "normal", officeEmoji: null },
      confirm: null,
    };
    assertButtonStyling(result, expectedResult);
  });
});
