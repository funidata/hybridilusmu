*** Settings ***
Library    Selenium2Library

*** Variables ***
${LOGIN URL}    https://dev-hytuslain.slack.com
${BROWSER}    Chrome
${EMAIL}    lindajokinenthai@gmail.com
${PASSWORD}    testisalasana123

*** Keywords ***
Open Slack In Browser And Login
    Open Browser    ${LOGIN URL}    ${BROWSER}
    Input Text    //input[@data-qa='login_email']    ${EMAIL}
    Input Password    //input[@data-qa='login_password']    ${PASSWORD}
    Click Element    //button[@data-qa='signin_button']
    Sleep    2s
    cancelPopup
    Go To    ${LOGIN URL}

Close Test Browser
    Close All Browsers