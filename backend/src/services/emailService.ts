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
  preservation_addon: boolean;
  preservation_billing_cycle: string | null;
  discount_requested: boolean;
  discount_type: string | null;
  payment_amount: number;
  created_at: Date;
  country: string | null;
  // Memorial data (included after publishing)
  memorial_id?: string;
  public_url?: string;
  qr_code_url?: string;
}

/**
 * Map tier codes to display names
 */
function getTierDisplayName(tierCode: string): string {
  const tierNames: Record<string, string> = {
    tier_1_marked: 'Tier I — Marked (Foundational Memorial)',
    tier_2_remembered: 'Tier II — Remembered (Narrated Story Memorial)',
    tier_3_enduring: 'Tier III — Enduring (Full Legacy Memorial)',
  };
  return tierNames[tierCode] || tierCode;
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
    const tierName = getTierDisplayName(data.tier_selected);

    // Format payment amount from cents to dollars
    const paymentAmountDollars = (data.payment_amount / 100).toFixed(2);

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
      <p><strong>Service Tier:</strong> ${tierName}</p>
      <p><strong>Preservation & Hosting Add-On:</strong> ${
        data.preservation_addon
          ? `Yes (${data.preservation_billing_cycle === 'monthly' ? 'Monthly ($2/month)' : 'Yearly ($12/year)'})`
          : 'No'
      }</p>
      <p><strong>Discount Requested:</strong> ${data.discount_requested ? `Yes (${data.discount_type || 'General'})` : 'No'}</p>
      <p><strong>Total Payment Amount:</strong> $${paymentAmountDollars}</p>

      <h3>Story / Written Tribute</h3>
      <p>${data.story_notes.replace(/\n/g, '<br>')}</p>

      <h3>Uploaded Media</h3>
      <ul>${mediaList}</ul>

      ${
        data.public_url && data.qr_code_url
          ? `
      <h3>Universal QR Code & Link</h3>
      <p><strong>Memorial Slug:</strong> ${data.public_url}</p>
      <p><strong>Universal Link:</strong> https://fcpmemorials.com/go?m=${data.public_url}</p>
      <p><strong>QR Code:</strong> <img src="${data.qr_code_url}" alt="Memorial QR Code" width="200" style="border: 1px solid #ddd; padding: 5px;" /></p>
      <p><em>Scanning this QR code will open the memorial on any device, with automatic app detection.</em></p>
      `
          : ''
      }

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
