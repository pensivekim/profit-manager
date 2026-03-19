const NHN_API_URL = 'https://api-alimtalk.cloud.toast.com/alimtalk/v2.3/appkeys';

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
}): Promise<{ success: boolean; error?: string }> {
  const { appKey, secretKey, senderKey, templateCode, recipientNo, templateParameter } = params;

  try {
    const res = await fetch(`${NHN_API_URL}/${appKey}/messages`, {
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
