import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!to) {
      throw new Error('Recipient email address ("to") is required');
    }
    if (!subject) {
      throw new Error('Email subject is required');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Skill Exchange Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error in sendEmail:', error.message);
    throw error;
  }
};

const buildSessionEmailHtml = (recipientName, sessionDetails, action, actionConfig) => {
  const skillName = sessionDetails.skillName || sessionDetails.skill || 'Skill Exchange';
  const partnerName = sessionDetails.partnerName || sessionDetails.senderName || 'A Platform User';
  const scheduledTime = sessionDetails.scheduledTime || sessionDetails.date || 'To Be Scheduled';
  const duration = sessionDetails.duration ? `${sessionDetails.duration} minutes` : 'N/A';
  const message = sessionDetails.message ? sessionDetails.message : null;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${actionConfig.subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 40px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Skill Exchange Platform</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <!-- Action Badge -->
                  <div style="display: inline-block; background-color: ${actionConfig.badgeBg}; color: ${actionConfig.badgeColor}; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; margin-bottom: 20px;">
                    ${actionConfig.actionTitle}
                  </div>
                  
                  <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 16px; font-size: 20px;">Hi ${recipientName || 'there'},</h2>
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    ${actionConfig.description(partnerName, skillName)}
                  </p>

                  <!-- Session Details Card -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 20px;">
                        <h3 style="margin: 0 0 14px 0; color: #1e293b; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Session Details</h3>
                        <table border="0" cellpadding="4" cellspacing="0" width="100%" style="color: #334155; font-size: 14px;">
                          <tr>
                            <td width="35%" style="font-weight: 600; color: #64748b;">Skill:</td>
                            <td style="font-weight: 500;">${skillName}</td>
                          </tr>
                          <tr>
                            <td style="font-weight: 600; color: #64748b;">Partner:</td>
                            <td style="font-weight: 500;">${partnerName}</td>
                          </tr>
                          <tr>
                            <td style="font-weight: 600; color: #64748b;">Scheduled Time:</td>
                            <td style="font-weight: 500;">${scheduledTime}</td>
                          </tr>
                          <tr>
                            <td style="font-weight: 600; color: #64748b;">Duration:</td>
                            <td style="font-weight: 500;">${duration}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  ${message ? `
                  <!-- Optional Note -->
                  <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="margin: 0; color: #1e40af; font-size: 14px; font-style: italic;">
                      "${message}"
                    </p>
                  </div>
                  ` : ''}

                  <p style="color: #64748b; font-size: 14px; margin-top: 30px; margin-bottom: 0;">
                    Log in to your dashboard to view your sessions and manage your skill exchanges.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    &copy; ${new Date().getFullYear()} Skill Exchange Platform. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export const sendSessionNotificationEmail = async (recipientEmail, recipientName, sessionDetails = {}, action) => {
  try {
    if (!recipientEmail) {
      throw new Error('Recipient email is required');
    }
    if (!action) {
      throw new Error('Session action type is required');
    }

    const skillName = sessionDetails.skillName || sessionDetails.skill || 'Skill Exchange';

    const actionConfigs = {
      request: {
        subject: `New Session Request: ${skillName}`,
        actionTitle: 'New Session Request',
        badgeBg: '#dbeafe',
        badgeColor: '#1e40af',
        description: (partner, skill) => `${partner} has requested a skill exchange session with you for <strong>${skill}</strong>.`,
      },
      accepted: {
        subject: `Session Request Accepted: ${skillName}`,
        actionTitle: 'Session Accepted',
        badgeBg: '#dcfce7',
        badgeColor: '#166534',
        description: (partner, skill) => `Great news! ${partner} has accepted your session request for <strong>${skill}</strong>.`,
      },
      rejected: {
        subject: `Update on Session Request: ${skillName}`,
        actionTitle: 'Session Declined',
        badgeBg: '#fee2e2',
        badgeColor: '#991b1b',
        description: (partner, skill) => `${partner} was unable to accept your session request for <strong>${skill}</strong> at this time.`,
      },
      completed: {
        subject: `Session Completed: ${skillName}`,
        actionTitle: 'Session Completed',
        badgeBg: '#f3e8ff',
        badgeColor: '#6b21a8',
        description: (partner, skill) => `Your skill exchange session for <strong>${skill}</strong> with ${partner} has been completed.`,
      },
      cancelled: {
        subject: `Session Cancelled: ${skillName}`,
        actionTitle: 'Session Cancelled',
        badgeBg: '#ffedd5',
        badgeColor: '#9a3412',
        description: (partner, skill) => `The skill exchange session for <strong>${skill}</strong> with ${partner} has been cancelled.`,
      },
    };

    const config = actionConfigs[action.toLowerCase()] || {
      subject: `Session Notification: ${skillName}`,
      actionTitle: `Session ${action}`,
      badgeBg: '#e2e8f0',
      badgeColor: '#334155',
      description: (partner, skill) => `There is an update regarding your session for <strong>${skill}</strong> with ${partner}.`,
    };

    const html = buildSessionEmailHtml(recipientName, sessionDetails, action, config);

    return await sendEmail({
      to: recipientEmail,
      subject: config.subject,
      html,
    });
  } catch (error) {
    console.error(`Error in sendSessionNotificationEmail (${action}):`, error.message);
    throw error;
  }
};

export default {
  sendEmail,
  sendSessionNotificationEmail,
};
