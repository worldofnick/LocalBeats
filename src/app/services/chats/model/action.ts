export enum Action {
    JOINED = 'userJoinedPrivateChat',
    LEFT = 'userLeftPrivateChat',
    NEW_LOG_IN = 'newUserLoggedIn',
    SMN_LOGGED_OUT = 'someUserLoggedOut',
    YOU_LOGGED_OUT = 'youLoggedOut',
    SEND_PRIVATE_MSG = 'sendPrivateMessage',
    SEND_MSG = 'sendMessage',
    PERSISTED_LOGIN = 'persistedLogin',
    REQUEST_PM_SOCKET_ID = 'requestSocketIdForPM',
    GREET_WITH_BEATBOT = 'addBeatBotToUserMessage',
    REQUEST_MSG_FROM_PROFILE_BUTTON = 'requestNewMsgFromProfileButtonClick',
    NOTIFY_SERVER_CHAT_LOADED = 'chatComponentDoneLoading',
    OPEN_SNACK_BAR_PM = 'openPmSnackBarThread',
    //notifications
    REQUEST_NOTIFICATIONS = 'notifications',
    REQUEST_NOTIFICATION_COUNT = 'notificationCount',
    TELL_NOTIFICATION_PANEL = 'tellNotificationPanel',
    NOTIFY_OTHER_HOSTS_BID_ACCEPTED = 'bidOtherHostsBidAccepted',
    UPDATE_PROFILE = 'updateProfile',
    TELL_TOP_BAR = 'tellTopBar'
}

