// TODO: 사용자 500명 이상 시 true로 변경
export const ALIMTALK_ENABLED = false;

const NHN_ALIMTALK_URL = 'https://api-alimtalk.cloud.toast.com/alimtalk/v2.3/appkeys';
const NHN_SMS_URL = 'https://api-sms.cloud.toast.com/sms/v3.0/appkeys';

function normalizePhone(phone: string): string {
  return phone.replace(/-/g, '');
}

export async function sendAlimtalk(params: {
  appKey: string;
  secretKey: string;
  senderKey: string;
  templateCode: string;
  recipientNo: string;
  templateParameter: Record<string, string>;
}): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
  const { appKey, secretKey, senderKey, templateCode, recipientNo, templateParameter } = params;

  if (!ALIMTALK_ENABLED) {
    console.log('[Alimtalk SKIPPED]', templateCode, recipientNo);
    return { success: true, skipped: true };
  }

  try {
    const res = await fetch(`${NHN_ALIMTALK_URL}/${appKey}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'X-Secret-Key': secretKey,
      },
      body: JSON.stringify({
        senderKey,
        templateCode,
        requestDate: '',
        senderGroupingKey: `profit_${Date.now()}`,
        recipientList: [{
          recipientNo: normalizePhone(recipientNo),
          templateParameter,
        }],
      }),
    });

    const result = await res.json();

    if (!res.ok || result.header?.isSuccessful === false) {
      return {
        success: false,
        error: result.header?.resultMessage || res.statusText,
      };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function sendSms(params: {
  appKey: string;
  secretKey: string;
  senderNo: string;
  recipientNo: string;
  body: string;
}): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
  const { appKey, secretKey, senderNo, recipientNo, body } = params;

  if (!ALIMTALK_ENABLED) {
    console.log('[SMS SKIPPED]', recipientNo, body.slice(0, 30));
    return { success: true, skipped: true };
  }

  try {
    const res = await fetch(`${NHN_SMS_URL}/${appKey}/sender/sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'X-Secret-Key': secretKey,
      },
      body: JSON.stringify({
        body,
        sendNo: normalizePhone(senderNo),
        recipientList: [{ recipientNo: normalizePhone(recipientNo) }],
      }),
    });

    const result = await res.json();
    if (!res.ok || result.header?.isSuccessful === false) {
      return { success: false, error: result.header?.resultMessage || res.statusText };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
