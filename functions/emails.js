const functions = require('firebase-functions');
const logger = require('firebase-functions/lib/logger');
const admin = require('firebase-admin');
const mailgun = require('mailgun-js');

if (!admin.apps.length) {
    admin.initializeApp();
}

/*
 * We are running this code in the Cloud Functions environment so we don't
 * have to provide any configuration, it's detected automatically from the
 * environment it runs in.
 */
const firestore = admin.firestore();
const config = functions.config();

const mg = mailgun({
    apiKey: config.mailgun.api_key,
    domain: config.mailgun.domain
});

const sendInvitationEmail = async invite => {
    try {
        const data = {
            from: `${invite.created_by.first_name} ${invite.created_by.last_name} via VoiceApp <${invite.invited_by}>`,
            to: invite.user.email,
            subject: 'Join the VoiceApp platform',
            text: `${invite.created_by.first_name} has invited you to join VoiceApp. Click on the link to add your password to complete your account registration (${config.admin.url}invites/${invite.token}). If you need help completing your account setup please email ${invite.invited_by} for assistance.`,
            template: 'default',
            'h:X-Mailgun-Variables': JSON.stringify({
                name: invite.user.first_name,
                textLine2: `If you need help completing your account setup please email ${invite.invited_by} for assistance.`,
                textLine1: `${invite.created_by.first_name} has invited you to join VoiceApp. Click on the link to add your password to complete your account registration.`,
                ctaLabel: 'View your invite',
                ctaUrl: `${config.admin.url}invites/${invite.token}`
            })
        };

        mg.messages().send(data, (error, body) => {
            if (error) {
                return logger.error('email not sent ', error.toString());
            }
        });
    } catch (error) {
        logger.error('email not sent ', error.toString());
    }
};

const sendMemberWelcomeEmail = async user => {
    try {
        const data = {
            from: 'VoiceApp <noreply@domain.com>',
            to: user.email,
            subject: 'Welcome to the VoiceApp!',
            template: `${user.role}-welcome`,
            'h:X-Mailgun-Variables': JSON.stringify({name: user.first_name})
        };

        mg.messages().send(data, (error, body) => {
            if (error) {
                return logger.error('email not sent ', error.toString());
            }
        });
    } catch (error) {
        logger.error('email not sent ', error.toString());
    }
};

exports.notifyUserOfInvite = functions.firestore
    .document('/invites/{inviteId}')
    .onCreate(async (snap, context) => {
        const invite = snap.data();

        if (invite) {
            sendInvitationEmail(invite);
        }
    });

exports.notifyUserOfInviteAccepted = functions.firestore
    .document('/invites/{inviteId}')
    .onUpdate(async (snap, context) => {
        /**
         * Invites are updated once the invited user has registered their account. In this moment
         * we can then notify the inviting user that their invite has been accepted.
         *
         * Additionally, invites could be updated if someone requests that the invitation email
         * be sent again.
         */
        try {
            const invite = snap.after.data();
            const previousData = snap.before.data();

            /**
             * Note that we remove PII from the user object once the invite has been accepted,
             * so we use `previousData` to get the user's name etc.
             */
            if (invite) {
                if (invite.status === 'accepted' && previousData.status === 'invited') {
                    const data = {
                        from: `VoiceApp <${previousData.user.email}>`,
                        to: invite.invited_by,
                        subject: 'VoiceApp invite accepted',
                        text: `${previousData.user.first_name} ${previousData.user.last_name} (${previousData.user.email}) has accepted your invitation to VoiceApp. You can now assign them to relevant projects and interviews.`,
                        template: 'default',
                        'h:X-Mailgun-Variables': JSON.stringify({
                            name: invite.created_by.first_name,
                            textLine2: '',
                            textLine1: `${previousData.user.first_name} ${previousData.user.last_name} (${previousData.user.email}) has accepted your invitation to VoiceApp. You can now assign them to relevant projects and interviews.`,
                            ctaLabel: 'Manage users',
                            ctaUrl: `${config.admin.url}users`
                        })
                    };

                    mg.messages().send(data, (error, body) => {
                        if (error) {
                            return logger.error('email not sent ', error.toString());
                        }
                    });

                    await sendMemberWelcomeEmail(previousData.user);
                } else if (
                    invite.email_last_sent &&
                    invite.email_last_sent !== previousData.email_last_sent
                ) {
                    await sendInvitationEmail(invite);
                }
            }
        } catch (error) {
            // console.log(error);
        }
    });
