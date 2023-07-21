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

const assertButtonStyling = (result, expected) => {
  assert.strictEqual(result.officeButtonColor, expected.officeButtonColor);
  assert.strictEqual(result.remoteButtonColor, expected.remoteButtonColor);
  assert.strictEqual(result.emojis.registrationEmoji, expected.emojis.registrationEmoji);
  assert.strictEqual(result.emojis.officeEmoji, expected.emojis.officeEmoji);
  assert.strictEqual(result.confirm, expected.confirm);
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
      confirm: null,
    };
    assertButtonStyling(result, expectedResult);
  });

  it("normal remote registration to another office and no default registration", () => {
    registration = { status: false, officeId: officeTwo.id, ...officeTwo };
    const { officeButtonColor, remoteButtonColor, emojis, confirm } = stylizeRegisterButtons(
      registration,
      defaultRegistration,
      selectedOffice,
    );
    assert.strictEqual(officeButtonColor, null);
    assert.strictEqual(remoteButtonColor, "danger");
    assert.strictEqual(emojis.registrationEmoji, "normal");
    assert.strictEqual(emojis.officeEmoji, officeTwo.officeEmoji);
    assert.notStrictEqual(confirm, null);
  });

  it("default office registration to selected office", () => {
    defaultRegistration = { status: true, officeId: officeOne.id, ...officeOne };
    const { officeButtonColor, remoteButtonColor, emojis, confirm } = stylizeRegisterButtons(
      registration,
      defaultRegistration,
      selectedOffice,
    );
    assert.strictEqual(officeButtonColor, "primary");
    assert.strictEqual(remoteButtonColor, null);
    assert.strictEqual(emojis.registrationEmoji, "default");
    assert.strictEqual(emojis.officeEmoji, null);
    assert.strictEqual(confirm, null);
  });

  it("default remote registration to selected office", () => {
    defaultRegistration = { status: false, officeId: officeOne.id, ...officeOne };
    const { officeButtonColor, remoteButtonColor, emojis, confirm } = stylizeRegisterButtons(
      registration,
      defaultRegistration,
      selectedOffice,
    );
    assert.strictEqual(officeButtonColor, null);
    assert.strictEqual(remoteButtonColor, "primary");
    assert.strictEqual(emojis.registrationEmoji, "default");
    assert.strictEqual(emojis.officeEmoji, null);
    assert.strictEqual(confirm, null);
  });

  it("default office registration to another office", () => {
    defaultRegistration = { status: true, officeId: officeTwo.id, ...officeTwo };
    const { officeButtonColor, remoteButtonColor, emojis, confirm } = stylizeRegisterButtons(
      registration,
      defaultRegistration,
      selectedOffice,
    );
    assert.strictEqual(officeButtonColor, "danger");
    assert.strictEqual(remoteButtonColor, null);
    assert.strictEqual(emojis.registrationEmoji, "default");
    assert.strictEqual(emojis.officeEmoji, officeTwo.officeEmoji);
    assert.notStrictEqual(confirm, null);
  });

  it("default remote registration to another office", () => {
    defaultRegistration = { status: false, officeId: officeTwo.id, ...officeTwo };
    const { officeButtonColor, remoteButtonColor, emojis, confirm } = stylizeRegisterButtons(
      registration,
      defaultRegistration,
      selectedOffice,
    );
    assert.strictEqual(officeButtonColor, null);
    assert.strictEqual(remoteButtonColor, "danger");
    assert.strictEqual(emojis.registrationEmoji, "default");
    assert.strictEqual(emojis.officeEmoji, officeTwo.officeEmoji);
    assert.notStrictEqual(confirm, null);
  });

  it("normal office registration to selected office with default office registration to another office", () => {
    registration = { status: true, officeId: officeOne.id, ...officeOne };
    defaultRegistration = { status: true, officeId: officeTwo.id, ...officeTwo };
    const { officeButtonColor, remoteButtonColor, emojis, confirm } = stylizeRegisterButtons(
      registration,
      defaultRegistration,
      selectedOffice,
    );
    assert.strictEqual(officeButtonColor, "primary");
    assert.strictEqual(remoteButtonColor, null);
    assert.strictEqual(emojis.registrationEmoji, "normal");
    assert.strictEqual(emojis.officeEmoji, null);
    assert.strictEqual(confirm, null);
  });

  it("normal remote registration to selected office with default office registration to another office", () => {
    registration = { status: false, officeId: officeOne.id, ...officeOne };
    defaultRegistration = { status: true, officeId: officeTwo.id, ...officeTwo };
    const { officeButtonColor, remoteButtonColor, emojis, confirm } = stylizeRegisterButtons(
      registration,
      defaultRegistration,
      selectedOffice,
    );
    assert.strictEqual(officeButtonColor, null);
    assert.strictEqual(remoteButtonColor, "primary");
    assert.strictEqual(emojis.registrationEmoji, "normal");
    assert.strictEqual(emojis.officeEmoji, null);
    assert.strictEqual(confirm, null);
  });
});
