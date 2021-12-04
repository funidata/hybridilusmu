*** Settings ***
Documentation    Tests to verify home tab functionality for a user with member role
Library    SeleniumLibrary    implicit_wait=10s
Library    Screenshot
Library    ./resources/HelpFunc.py
Resource    ./resources/common.robot

Suite Setup    common.Open Slack In Browser And Login As User
Suite Teardown    common.Close Test Browser

*** Test Cases ***
Can Open Home Tab
    Maximize Browser Window
    Go To Home Tab

Correct Dates
    Wait Until Element Is Visible    //button[@data-qa-action-id='update_click']
    @{DATES}=    Get Dates For Home Tab Signups
    FOR    ${ITEM}    IN    @{DATES}
        Wait Until Element Is Visible    //div[@data-qa='block-kit-renderer']//div[contains(h3, '${ITEM}')]
        Scroll Element Into View    //div[@data-qa='block-kit-renderer']//div[contains(h3, '${ITEM}')]
    END

Regular Signup For Next Working day
    ${date}=    Get Next Working day
    Scroll Element Into View    //div[@data-qa='block-kit-renderer']//div[5]
    Element Should Contain    //div[@data-qa='block-kit-renderer']//div[5]    Kukaan ei ole ilmoittautunut toimistolle!
    Regular Signup    ${date}
    Sleep    2s
    Element Should Contain    //div[@data-qa='block-kit-renderer']//div[contains(h3, '${date}')]/following-sibling::div[1]//span[1]    Toimistolla aikoo olla:
    Page Should Contain Element    //div[@data-qa='block-kit-renderer']//div[contains(h3, '${date}')]/following-sibling::div[1]//span[1]//a[@data-stringify-label='@Jäsen Testikäyttäjä']
    Regular Signup    ${date}



