AdminCommand
    =   WS c:AdminCommand WS? { return c; }
    /   ADMIN WS SERVER WS SETTINGS { return { 'adminCommand': 'server settings' }; }
    /   ADMIN WS CHANNEL { return { 'adminCommand': 'admin channel' }; }
    ;

ADMIN
    =   'admin'i
    ;
CHANNEL
    =   'channel'i
    ;
SERVER
    =   'server'i
    ;
SETTINGS
    =   'settings'i
    ;
WS  =   [ \t\r\n]+
    ;
