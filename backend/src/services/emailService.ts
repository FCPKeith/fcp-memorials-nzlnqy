import { resend } from "@specific-dev/framework";
import type { FastifyBaseLogger } from "fastify";

interface MemorialRequestEmailData {
  id: string;
  requester_name: string;
  requester_email: string | null;
  loved_one_name: string;
  birth_date: string | null;
  death_date: string | null;
  story_notes: string;
  media_uploads: string[];
  location_info: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  tier_selected: string;
  discount_requested: boolean;
  discount_type: string | null;
  created_at: Date;
  country: string | null;
}

/**
 * Format media uploads as HTML list
 */
function formatMediaUploads(media: string[]): string {
  if (!media || media.length === 0) {
    return '<li>Not provided</li>';
  }
  return media.map(url => `<li><a href="${url}" target="_blank">${url}</a></li>`).join('');
}

/**
 * Format location information with GPS coordinates
 */
function formatLocation(latitude: string | number | null, longitude: string | number | null, locationInfo: string | null): string {
  const parts: string[] = [];

  if (latitude && longitude) {
    parts.push(`GPS: ${latitude}, ${longitude}`);
  }

  if (locationInfo) {
    parts.push(`Cemetery: ${locationInfo}`);
  }

  return parts.length > 0 ? parts.join(' | ') : 'Not provided';
}

/**
 * Send email notification for a new memorial request
 */
export async function sendMemorialRequestNotification(
  data: MemorialRequestEmailData,
  logger: FastifyBaseLogger
): Promise<void> {
  try {
    const formattedDate = new Date(data.created_at).toISOString();
    const location = formatLocation(data.latitude, data.longitude, data.location_info);
    const mediaList = formatMediaUploads(data.media_uploads);

    const emailBody = `
      <h2>New Memorial Request Submission</h2>

      <h3>Request Details</h3>
      <p><strong>Request ID:</strong> ${data.id}</p>
      <p><strong>Submission Time:</strong> ${formattedDate}</p>

      <h3>Submitter Information</h3>
      <p><strong>Submitter Name:</strong> ${data.requester_name}</p>
      <p><strong>Submitter Email:</strong> ${data.requester_email || 'Not provided'}</p>

      <h3>Memorial Information</h3>
      <p><strong>Name of Deceased:</strong> ${data.loved_one_name}</p>
      <p><strong>Birth Date:</strong> ${data.birth_date || 'Not provided'}</p>
      <p><strong>Death Date:</strong> ${data.death_date || 'Not provided'}</p>

      <h3>Location</h3>
      <p><strong>Grave Location:</strong> ${location}</p>
      ${data.country ? `<p><strong>Country:</strong> ${data.country}</p>` : ''}

      <h3>Service Information</h3>
      <p><strong>Service Tier:</strong> ${data.tier_selected}</p>
      <p><strong>Discount Requested:</strong> ${data.discount_requested ? `Yes (${data.discount_type || 'General'})` : 'No'}</p>

      <h3>Story / Written Tribute</h3>
      <p>${data.story_notes.replace(/\n/g, '<br>')}</p>

      <h3>Uploaded Media</h3>
      <ul>${mediaList}</ul>

      <hr>
      <p><em>This is an automated notification from the memorial request system.</em></p>
    `;

    const { error } = await resend.emails.send({
      from: 'Memorial Requests <noreply@floatincoffin.com>',
      to: 'floatincoffin@icloud.com',
      subject: `New Memorial Request for ${data.loved_one_name}`,
      html: emailBody,
    });

    if (error) {
      logger.error(
        { err: error, requestId: data.id },
        'Failed to send memorial request notification email'
      );
    } else {
      logger.info(
        { requestId: data.id, recipientEmail: 'floatincoffin@icloud.com' },
        'Memorial request notification email sent successfully'
      );
    }
  } catch (error) {
    logger.error(
      { err: error, requestId: data.id },
      'Exception while sending memorial request notification email'
    );
  }
}
