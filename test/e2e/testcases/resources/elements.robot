*** Variables ****
${login_email}    //input[@data-qa='login_email']
${login_password}    //input[@data-qa='login_password']
${login_button}    //button[@data-qa='signin_button']

${channel_name}    //div[@data-qa='channel_name']
${latest_message}    (//div[@class='c-virtual_list__scroll_container'])[2]/div[@class='c-virtual_list__item'][last()]
${message_input}    //div[@data-qa='message_input']/div
${send_message_button}    //button[@data-qa='texty_send_button']
${new_messages_button}    //button[@class='c-button-unstyled p-message_pane__unread_banner__msg']
${messages_tab}    //button[@data-qa='messages']
${app_home}    //span[@data-qa='channel_sidebar_name_test-hybridilusmu']

${update_button}    //button[@data-qa-action-id='update_click']
${update_text}    //div[@data-qa='block-kit-renderer']//div[3]
${office_button_writing_hand}    //button[@data-qa-action-id='office_click']//img[@data-stringify-emoji=':writing_hand:']
${office_button_robot_face}    //div[@data-qa='block-kit-renderer']//div[contains(h3, 'Maanantai')]/following-sibling::div[3]//button[@data-qa-action-id='office_click']//img[@data-stringify-emoji=':robot_face:']   
${remote_button_writing_hand}    //button[@data-qa-action-id='remote_click']//img[@data-stringify-emoji=':writing_hand:']
${remote_button_robot_face}    //div[@data-qa='block-kit-renderer']//div[contains(h3, 'Maanantai')]/following-sibling::div[3]//button[@data-qa-action-id='remote_click']//img[@data-stringify-emoji=':robot_face:']
${default_settings_button}    //button[@data-qa-action-id='settings_click']
${default_signup_monday_button}    //div[@data-qa='wizard_modal_body']/div[@data-qa='block-kit-renderer']/div[3]//button[@data-qa-action-id='default_office_click']
${default_remote_signup_monday_button}    //div[@data-qa='wizard_modal_body']/div[@data-qa='block-kit-renderer']/div[3]//button[@data-qa-action-id='default_remote_click']
${close_default_settings_button}    //button[@data-qa='wizard_modal_back']

${monday_info}    //div[@data-qa='block-kit-renderer']//div[contains(h3, 'Maanantai')]/following-sibling::div[1]
