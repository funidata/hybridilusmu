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

const usergroupsListFailedPayload = {
    ok: false,
    error: 'plan_upgrade_required',
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

const usergroupsListWithUsersPayloadAlt = {
    ok: true,
    usergroups: [
        {
            id: 'Spannu',
            team_id: 'Tdevausnurkka',
            is_usergroup: true,
            name: 'Pannunkantajat',
            description: 'Kahvipannun varjelijat',
            handle: 'pannu',
            is_external: false,
            date_create: 1635595867,
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
            ],
            user_count: 1,
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

const usergroupsUsersListFailedPayload = {
    ok: false,
    error: 'no_such_subteam',
};

describe('usergroups: Plumbing', function () {
    this.beforeEach(() => {
        usergroups._clearData();
    });

    it('no channels for unknown usergroup', () => {
        assert.equal(usergroups.getChannelsForUsergroup('Solematon').length, 0);
    });

    it('no users for unknown usergroup', () => {
        assert.equal(usergroups.getUsersForUsergroup('Solematon').length, 0);
    });

    it('no usergroups for unknown user', () => {
        assert.equal(usergroups.getUsergroupsForUser('Uolematon').length, 0);
    });
});

describe('usergroups: Populate from API call', function () {
    this.beforeEach(() => {
        usergroups._clearData();
    });

    it('failed usergroups.list works as expected', () => {
        assert.equal(
            usergroups.insertUsergroupsFromAPIListResponse(usergroupsListFailedPayload),
            false,
        );
    });

    it('failed usergroups.users.list works as expected', () => {
        assert.equal(
            usergroups.insertUsergroupUsersFromAPIListResponse(usergroupsUsersListFailedPayload),
            false,
        );
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
        assert.equal(usergroups.getChannelsForUsergroup('Skahvi').length, 1);
        assert.equal(usergroups.getChannelsForUsergroup('Skahvi')[0], 'Ckahvinkeitin');
    });

    it('usergroups.list with users included, where group disappears', () => {
        assert.equal(
            usergroups.insertUsergroupsFromAPIListResponse(usergroupsListWithUsersPayload),
            true,
        );
        assert.equal(usergroups.getUsergroupsForUser('Umeklu').length, 1);
        assert.equal(usergroups.getUsergroupsForUser('Umeklu')[0], 'Skahvi');
        assert.equal(
            usergroups.insertUsergroupsFromAPIListResponse(usergroupsListWithUsersPayloadAlt),
            true,
        );
        assert.equal(usergroups.getUsergroupsForUser('Umeklu').length, 1);
        assert.equal(usergroups.getUsergroupsForUser('Umeklu')[0], 'Spannu');
        assert.equal(usergroups.getUsersForUsergroup('Spannu').length, 1);
        assert.equal(usergroups.getUsersForUsergroup('Spannu')[0], 'Umeklu');
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

    it('updated: stale data not used', () => {
        assert.equal(usergroups.processCreationEvent(createEventPayload), true);
        assert.equal(usergroups.processUpdateEvent(updateEventPayload), true);
        assert.equal(usergroups.processUpdateEvent({
            ...updateEventPayload,
            subteam: {
                ...updateEventPayload.subteam,
                date_update: updateEventPayload.subteam.date_update - 1,
                users: [],
                user_count: 0,
            },
        }), false);
        assert.equal(
            usergroups._dumpState().usergroups.Skahvi.date_update,
            updateEventPayload.subteam.date_update,
        );
        assert.notEqual(usergroups.getUsersForUsergroup('Skahvi').length, 0);
    });

    it('updated: channel dropping drops channels', () => {
        const channellessUpdate = {
            ...updateEventPayload,
            subteam: {
                ...updateEventPayload.subteam,
                date_previous_update: updateEventPayload.subteam.date_update,
                date_update: updateEventPayload.subteam.date_update + 1,
                prefs: {
                    ...updateEventPayload.subteam.prefs,
                    channels: [],
                },
            },
        };
        assert.equal(usergroups.processCreationEvent(createEventPayload), true);
        assert.equal(usergroups.processUpdateEvent(updateEventPayload), true);
        assert.equal(usergroups.processUpdateEvent(channellessUpdate), true);
        assert.equal(
            usergroups._dumpState().usergroups.Skahvi.date_update,
            channellessUpdate.subteam.date_update,
        );
        assert.equal(usergroups.getChannelsForUsergroup('Skahvi').length, 0);
        assert.equal(usergroups.getUsergroupsForChannel('Ckahvinkeitin').length, 0);
    });

    it('updated: not listing users causes dirtiness', () => {
        const userlessUpdate = {
            ...updateEventPayload,
            subteam: {
                ...updateEventPayload.subteam,
            },
        };
        delete userlessUpdate.subteam.users;
        assert.equal(usergroups.processCreationEvent(createEventPayload), true);
        assert.equal(usergroups.processUpdateEvent(userlessUpdate), false);
        assert.equal(
            usergroups._dumpState().usergroups.Skahvi.date_update,
            userlessUpdate.subteam.date_update,
        );
        assert.equal(
            usergroups._dumpState().usergroups.Skahvi._dirty_date,
            createEventPayload.subteam.date_update,
        );
        assert.equal(usergroups.isDirty('Skahvi'), true);
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

    it('members_changed: event for unknown usergroup not processed', () => {
        assert.equal(usergroups.processMembersChangedEvent({
            ...membersChangedEventPayload,
            subteam_id: 'Solematon',
        }), false);
    });

    it('members_changed: event with mismatched update time not processed', () => {
        assert.equal(usergroups.processCreationEvent(createEventPayload), true);
        assert.equal(usergroups.processUpdateEvent(updateEventPayload), true);
        assert.equal(usergroups.processMembersChangedEvent({
            ...membersChangedEventPayload,
            date_previous_update: membersChangedEventPayload.date_previous_update - 1,
        }), false);
        assert.equal(
            usergroups._dumpState().usergroups.Skahvi.date_update,
            updateEventPayload.subteam.date_update,
        );
        assert.equal(usergroups.isUserInUsergroup('Umeklu', 'Skahvi'), true);
        assert.equal(usergroups.isUserInUsergroup('Umcafee', 'Skahvi'), true);
        assert.equal(usergroups.isUserInUsergroup('Ukernighan', 'Skahvi'), false);
        assert.equal(usergroups.isUserInUsergroup('Uritchie', 'Skahvi'), false);
    });

    it('wrong event types are not processed', () => {
        assert.equal(usergroups.processCreationEvent(updateEventPayload), false);
        assert.equal(usergroups.processUpdateEvent(membersChangedEventPayload), false);
        assert.equal(usergroups.processMembersChangedEvent(createEventPayload), false);
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

    it('plain text descriptor string for unknown usergroup', () => {
        assert.equal(usergroups.generatePlaintextString('Solematon'), '');
    });

    it('plain text descriptor string for known usergroup', () => {
        usergroups.processCreationEvent(createEventPayload);
        assert.equal(usergroups.generatePlaintextString('Skahvi'), 'Kahvinkittaajat (@kahvi)');
        usergroups._clearData();
    });
});

describe('usergroups: String parsing', () => {
    it('mention string for unlabeled usergroup', () => {
        assert.equal(usergroups.parseMentionString('<!subteam^Solematon>'), 'Solematon');
    });

    it('mention string for labeled usergroup', () => {
        assert.equal(usergroups.parseMentionString('<!subteam^Skahvi|@kahvi>'), 'Skahvi');
    });

    it('invalid mention string', () => {
        assert.equal(usergroups.parseMentionString('<!subteam^Skahvi'), false);
        assert.equal(usergroups.parseMentionString('Skahvi'), false);
    });
});
