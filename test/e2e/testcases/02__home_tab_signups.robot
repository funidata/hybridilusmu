*** Settings ***
Documentation    Tests to verify home tab functionality for a user with member role
Library    SeleniumLibrary    implicit_wait=10s
Library    Screenshot
Library    ./resources/HelpFunc.py
Resource    ./resources/common.robot
Resource    ./resources/elements.robot
Resource    ./resources/home_tab_res.robot

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

Add And Remove Regular Signup For Next Working Day
    ${DATE}=    Get Next Working Day
    Set Suite Variable    ${DATE}    ${DATE}
    ${next_workday_info}=    Get Next Workday Info Element    ${DATE}
    Set Suite Variable    ${next_workday_info}    ${next_workday_info}
    Scroll Element Into View    ${next_workday_info}
    Element Should Not Contain    ${next_workday_info}    @Jäsen Testikäyttäjä
    Regular Office Signup    ${DATE}
    Wait For Bot action
    Element Should Contain    ${next_workday_info}    Toimistolla aikoo olla:
    Page Should Contain Element    ${next_workday_info}//a[@data-stringify-label='@Jäsen Testikäyttäjä']
    ${next_workday_buttons}=    Get Next Workday Buttons Element    ${DATE}
    Set Suite Variable    ${next_workday_buttons}    ${next_workday_buttons}
    Page Should Contain Element    ${next_workday_buttons}${office_button_writing_hand}
    Regular Office Signup    ${DATE}
    Wait For Bot action
    Element Should Not Contain    ${next_workday_info}    @Jäsen Testikäyttäjä

Add And Remove Remote Signup For Next Working Day
    Update Home Tab View
    Scroll Element Into View    ${next_workday_info}
    Regular Remote Signup    ${DATE}
    Wait For Bot action
    Element Should Not Contain    ${next_workday_info}    @Jäsen Testikäyttäjä
    Page Should Contain Element    ${next_workday_buttons}${remote_button_writing_hand}
    Regular Remote Signup    ${DATE}
    Wait For Bot action
    Page Should Not Contain Element    ${next_workday_buttons}${remote_button_writing hand}

Default Signup For Mondays
    Update Home Tab View
    Click Element    ${default_settings_button}
    Wait Until Element Is Visible    ${default_signup_monday_button}
    Click Element    ${default_signup_monday_button}
    Wait For Bot action
    Click Element    ${close_default_settings_button}
    Element Should Contain    ${monday_info}    @Jäsen Testikäyttäjä
    Page Should Contain Element    ${office_button_robot_face}

Default Remote Signup For Mondays
    Click Element    ${default_settings_button}
    Wait Until Element Is Visible    ${default_remote_signup_monday_button}
    Click Element    ${default_remote_signup_monday_button}
    Wait For Bot action
    Click Element    ${close_default_settings_button}
    Element Should Not Contain    ${monday_info}    @Jäsen Testikäyttäjä
    Page Should Contain Element    ${remote_button_robot_face}
