/* eslint-disable no-underscore-dangle */
const assert = require('assert');
const usergroups = require('../usergroups');

const createEventPayload = {
    type: 'subteam_created',
    subteam: {
        id: 'Skahvi',
        team_id: 'Tdevausnurkka',
        is_usergroup: true,
        name: 'Kahvinkittaajat',
        description: 'Kofeiiniaddiktit jne.',
        handle: 'kahvi',
        is_external: false,
        date_create: 1635594853,
        date_update: 1635594853,
        date_delete: 0,
        auto_type: null,
        created_by: 'Umeklu',
        updated_by: 'Umeklu',
        deleted_by: null,
        prefs: {
            channels: [
                'Ckahvinkeitin',
            ],
            groups: [],
        },
        users: [
            'Umeklu',
        ],
        user_count: 1,
        // note that channel_count is zero, even though we have a channel under prefs.channels
        channel_count: 0,
    },
};

const updateEventPayload = {
    type: 'subteam_updated',
    subteam: {
        id: 'Skahvi',
        team_id: 'Tdevausnurkka',
        is_usergroup: true,
        is_subteam: true,
        name: 'Kahvinkittaajat',
        description: 'Kofeiiniaddiktit jne.',
        handle: 'kahvi',
        is_external: false,
        date_create: 1635594853,
        date_update: 1635595768,
        date_delete: 0,
        auto_type: null,
        created_by: 'Umeklu',
        updated_by: 'Umeklu',
        deleted_by: null,
        prefs: {
            channels: [
                'Ckahvinkeitin',
            ],
            groups: [],
        },
        users: [
            'Umeklu',
            'Umcafee',
        ],
        user_count: 2,
        channel_count: 0,
    },
};

const membersChangedEventPayload = {
    type: 'subteam_members_changed',
    subteam_id: 'Skahvi',
    team_id: 'Tdevausnurkka',
    date_previous_update: 1635595768,
    date_update: 1635595867,
    added_users: [
        'Ukernighan',
        'Uritchie',
    ],
    added_users_count: 2,
    removed_users: [
        'Umcafee',
    ],
    removed_users_count: 1,
};

const usergroupsListPayload = {
    ok: true,
    usergroups: [
        {
            id: 'Skahvi',
            team_id: 'Tdevausnurkka',
            is_usergroup: true,
            name: 'Kahvinkittaajat',
            description: 'Kofeiiniaddiktit jne.',
            handle: 'kahvi',
            is_external: false,
            date_create: 1635594853,
            date_update: 1635595867,
            date_delete: 0,
            auto_type: 'admin',
            created_by: 'Umeklu',
            updated_by: 'Umeklu',
            deleted_by: null,
            prefs: {
                channels: [
                    'Ckahvinkeitin',
                ],
                groups: [],
            },
            user_count: 3,
        },
    ],
};

const usergroupsListWithUsersPayload = {
    ok: true,
    usergroups: [
        {
            id: 'Skahvi',
            team_id: 'Tdevausnurkka',
            is_usergroup: true,
            name: 'Kahvinkittaajat',
            description: 'Kofeiiniaddiktit jne.',
            handle: 'kahvi',
            is_external: false,
            date_create: 1635594853,
            date_update: 1635595867,
            date_delete: 0,
            auto_type: 'admin',
            created_by: 'Umeklu',
            updated_by: 'Umeklu',
            deleted_by: null,
            prefs: {
                channels: [
                    'Ckahvinkeitin',
                ],
                groups: [],
            },
            users: [
                'Umeklu',
                'Ukernighan',
                'Uritchie',
            ],
            user_count: 3,
        },
    ],
};

const usergroupsUsersListPayload = {
    ok: true,
    users: [
        'Umeklu',
        'Ukernighan',
        'Uritchie',
    ],
};

describe('usergroups: Populate from API call', function () {
    this.beforeEach(() => {
        usergroups._clearData();
    });

    it('usergroups.list with users included', () => {
        assert.equal(
            usergroups.insertUsergroupsFromAPIListResponse(usergroupsListWithUsersPayload),
            true,
        );
        assert.equal(usergroups.isUserInUsergroup('Umeklu', 'Skahvi'), true);
        assert.equal(usergroups.isUserInUsergroup('Umcafee', 'Skahvi'), false);
        assert.equal(usergroups.isUserInUsergroup('Ukernighan', 'Skahvi'), true);
        assert.equal(usergroups.isUserInUsergroup('Uritchie', 'Skahvi'), true);
    });

    it('usergroups.list without providing users is falsy', () => {
        assert.equal(usergroups.insertUsergroupsFromAPIListResponse(usergroupsListPayload), false);
    });

    it('usergroups.list + usergroups.users.list inserts things correctly', () => {
        assert.equal(usergroups.insertUsergroupsFromAPIListResponse(usergroupsListPayload), false);
        assert.equal(
            usergroups.insertUsergroupUsersFromAPIListResponse(
                usergroupsUsersListPayload,
                usergroupsListPayload.usergroups[0].id,
            ),
            true,
        );
        assert.equal(usergroups.isUserInUsergroup('Umeklu', 'Skahvi'), true);
        assert.equal(usergroups.isUserInUsergroup('Umcafee', 'Skahvi'), false);
        assert.equal(usergroups.isUserInUsergroup('Ukernighan', 'Skahvi'), true);
        assert.equal(usergroups.isUserInUsergroup('Uritchie', 'Skahvi'), true);
    });
});

describe('usergroups: Event based population', function () {
    this.beforeEach(() => {
        usergroups._clearData();
    });

    it('created', () => {
        assert.equal(usergroups.processCreationEvent(createEventPayload), true);
        assert.equal(
            usergroups._dumpState().usergroups.Skahvi.date_update,
            createEventPayload.subteam.date_update,
        );
        assert.equal(usergroups.isUserInUsergroup('Umeklu', 'Skahvi'), true);
        assert.equal(usergroups.isUserInUsergroup('Umcafee', 'Skahvi'), false);
        assert.equal(usergroups.isUserInUsergroup('Ukernighan', 'Skahvi'), false);
        assert.equal(usergroups.isUserInUsergroup('Uritchie', 'Skahvi'), false);
    });

    it('updated', () => {
        assert.equal(usergroups.processCreationEvent(createEventPayload), true);
        assert.equal(usergroups.processUpdateEvent(updateEventPayload), true);
        assert.equal(
            usergroups._dumpState().usergroups.Skahvi.date_update,
            updateEventPayload.subteam.date_update,
        );
        assert.equal(usergroups.isUserInUsergroup('Umeklu', 'Skahvi'), true);
        assert.equal(usergroups.isUserInUsergroup('Umcafee', 'Skahvi'), true);
        assert.equal(usergroups.isUserInUsergroup('Ukernighan', 'Skahvi'), false);
        assert.equal(usergroups.isUserInUsergroup('Uritchie', 'Skahvi'), false);
    });

    it('members_changed', () => {
        assert.equal(usergroups.processCreationEvent(createEventPayload), true);
        assert.equal(usergroups.processUpdateEvent(updateEventPayload), true);
        assert.equal(usergroups.processMembersChangedEvent(membersChangedEventPayload), true);
        assert.equal(
            usergroups._dumpState().usergroups.Skahvi.date_update,
            membersChangedEventPayload.date_update,
        );
        assert.equal(usergroups.isUserInUsergroup('Umeklu', 'Skahvi'), true);
        assert.equal(usergroups.isUserInUsergroup('Umcafee', 'Skahvi'), false);
        assert.equal(usergroups.isUserInUsergroup('Ukernighan', 'Skahvi'), true);
        assert.equal(usergroups.isUserInUsergroup('Uritchie', 'Skahvi'), true);
    });
});

describe('usergroups: String generation', () => {
    it('mention string for unknown usergroup', () => {
        assert.equal(usergroups.generateMentionString('Solematon'), '<!subteam^Solematon>');
    });

    it('mention string for known usergroup', () => {
        usergroups.processCreationEvent(createEventPayload);
        assert.equal(usergroups.generateMentionString('Skahvi'), '<!subteam^Skahvi|@kahvi>');
    });

    it('plain text descriptor string', () => {
        usergroups.processCreationEvent(createEventPayload);
        assert.equal(usergroups.generatePlaintextString('Skahvi'), 'Kahvinkittaajat (@kahvi)');
        usergroups._clearData();
    });
});
