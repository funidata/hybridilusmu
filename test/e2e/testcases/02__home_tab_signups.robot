*** Settings ***
Documentation    Tests to verify home tab functionality for a user with member role
Library    SeleniumLibrary    implicit_wait=10s
Library    Screenshot
Library    ./resources/HelpFunc.py
Resource    ./resources/common.robot
Resource    ./resources/elements.robot

Suite Setup    common.Open Slack In Browser And Login As User
Suite Teardown    common.Close Test Browser

*** Test Cases ***
Can Open Home Tab
    Maximize Browser Window
    Go To Home Tab

Correct Dates
    Update Home Tab View
    Wait Until Element Is Visible    ${update_button}
    @{DATES}=    Get Dates For Home Tab Signups
    FOR    ${ITEM}    IN    @{DATES}
        Wait Until Element Is Visible    //div[@data-qa='block-kit-renderer']//div[contains(h3, '${ITEM}')]
        Scroll Element Into View    //div[@data-qa='block-kit-renderer']//div[contains(h3, '${ITEM}')]
    END

Regular Signup For Next Working Day
    ${date}=    Get Next Working Day
    Scroll Element Into View    //div[@data-qa='block-kit-renderer']//div[7]
    Element Should Not Contain    //div[@data-qa='block-kit-renderer']//div[7]    @Jäsen Testikäyttäjä
    Regular Office Signup    ${date}
    Sleep    2s
    Element Should Contain    //div[@data-qa='block-kit-renderer']//div[contains(h3, '${date}')]/following-sibling::div[1]//span[1]    Toimistolla aikoo olla:
    Page Should Contain Element    //div[@data-qa='block-kit-renderer']//div[contains(h3, '${date}')]/following-sibling::div[1]//span[1]//a[@data-stringify-label='@Jäsen Testikäyttäjä']
    Page Should Contain Element    //button[@data-qa-action-id='office_click']//img[@data-stringify-emoji=':writing_hand:']
    Regular Office Signup    ${date}

Remote Signup For Next Working Day
    Update Home Tab View
    ${date}=    Get Next Working Day
    Scroll Element Into View    //div[@data-qa='block-kit-renderer']//div[7]
    Regular Remote Signup    ${date}
    Sleep    2s
    Element Should Contain    //div[@data-qa='block-kit-renderer']//div[7]    Kukaan ei ole ilmoittautunut toimistolle!
    Page Should Contain Element    //button[@data-qa-action-id='remote_click']//img[@data-stringify-emoji=':writing_hand:']
    Regular Remote Signup    ${date}

Default Signup For Mondays
    Update Home Tab View
    Click Element    //button[@data-qa-action-id='settings_click']
    Wait Until Element Is Visible    //div[@data-qa='wizard_modal_body']/div[@data-qa='block-kit-renderer']/div[3]//button[@data-qa-action-id='default_office_click']
    Click Element    //div[@data-qa='wizard_modal_body']/div[@data-qa='block-kit-renderer']/div[3]//button[@data-qa-action-id='default_office_click']
    Sleep    2s
    Click Element    //button[@data-qa='wizard_modal_back']
    Element Should Contain    //div[@data-qa='block-kit-renderer']//div[contains(h3, 'Maanantai')]/following-sibling::div[1]    @Jäsen Testikäyttäjä
    Page Should Contain Element    //div[@data-qa='block-kit-renderer']//div[contains(h3, 'Maanantai')]/following-sibling::div[3]//button[@data-qa-action-id='office_click']//img[@data-stringify-emoji=':robot_face:']

Default Remote Signup For Mondays
    Click Element    //button[@data-qa-action-id='settings_click']
    Wait Until Element Is Visible    //div[@data-qa='wizard_modal_body']/div[@data-qa='block-kit-renderer']/div[3]//button[@data-qa-action-id='default_remote_click']
    Click Element    //div[@data-qa='wizard_modal_body']/div[@data-qa='block-kit-renderer']/div[3]//button[@data-qa-action-id='default_remote_click']
    Sleep    2s
    Click Element    //button[@data-qa='wizard_modal_back']
    Element Should Not Contain    //div[@data-qa='block-kit-renderer']//div[contains(h3, 'Maanantai')]/following-sibling::div[1]    @Jäsen Testikäyttäjä
    Page Should Contain Element    //div[@data-qa='block-kit-renderer']//div[contains(h3, 'Maanantai')]/following-sibling::div[3]//button[@data-qa-action-id='remote_click']//img[@data-stringify-emoji=':robot_face:']
