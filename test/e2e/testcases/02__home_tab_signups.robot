*** Settings ***
Library    Selenium2Library
Library    Screenshot
Library    ../resources/HelpFunc.py
Resource    ../resources/common.robot

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