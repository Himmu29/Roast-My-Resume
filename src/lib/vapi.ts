export function resolveVapiPublicKeys(): string[] {
  const envObj: Record<string, any> = {
    ...(typeof process !== 'undefined' ? process.env : {}),
    ...((import.meta as any).env || {}),
  };

  const rawKeys: (string | undefined)[] = [
    envObj.PUBLIC_VAPI_API_KEY,
    envObj.PUBLIC_VAPI_API_KEY_1,
    envObj.PUBLIC_VAPI_API_KEY_2,
    envObj.PUBLIC_VAPI_API_KEY_3,
    envObj.PUBLIC_VAPI_KEY,
    envObj.PUBLIC_VAPI_KEY_1,
    envObj.PUBLIC_VAPI_KEY_2,
    envObj.VAPI_PUBLIC_KEY,
    envObj.VAPI_PUBLIC_KEY_1,
    envObj.VAPI_PUBLIC_KEY_2,
  ];

  if (typeof window !== 'undefined') {
    rawKeys.push(localStorage.getItem('vapi_public_key') || undefined);
  }

  for (const [key, value] of Object.entries(envObj)) {
    if (
      /^(PUBLIC_VAPI_API_KEY|PUBLIC_VAPI_KEY|VAPI_PUBLIC_KEY)(_\d+)?$/i.test(key) &&
      typeof value === 'string'
    ) {
      rawKeys.push(value);
    }
  }

  const validKeys: string[] = [];
  for (const k of rawKeys) {
    if (
      typeof k === 'string' &&
      k.trim().length > 0 &&
      k.trim() !== 'your_vapi_public_key_here'
    ) {
      const trimmed = k.trim();
      if (!validKeys.includes(trimmed)) {
        validKeys.push(trimmed);
      }
    }
  }

  if (validKeys.length === 0) {
    validKeys.push('d7be711a-6328-45f3-85a5-dfb07c856a67');
  }

  return validKeys;
}

export function resolveVapiAssistantIds(): string[] {
  const envObj: Record<string, any> = {
    ...(typeof process !== 'undefined' ? process.env : {}),
    ...((import.meta as any).env || {}),
  };

  const rawIds: (string | undefined)[] = [
    envObj.PUBLIC_VAPI_ASSISTANT_ID,
    envObj.PUBLIC_VAPI_ASSISTANT_ID_1,
    envObj.PUBLIC_VAPI_ASSISTANT_ID_2,
    envObj.PUBLIC_VAPI_ASSISTANT_ID_3,
    envObj.VAPI_ASSISTANT_ID,
    envObj.VAPI_ASSISTANT_ID_1,
    envObj.VAPI_ASSISTANT_ID_2,
  ];

  if (typeof window !== 'undefined') {
    rawIds.push(localStorage.getItem('vapi_assistant_id') || undefined);
  }

  for (const [key, value] of Object.entries(envObj)) {
    if (
      /^(PUBLIC_VAPI_ASSISTANT_ID|VAPI_ASSISTANT_ID)(_\d+)?$/i.test(key) &&
      typeof value === 'string'
    ) {
      rawIds.push(value);
    }
  }

  const validIds: string[] = [];
  for (const id of rawIds) {
    if (
      typeof id === 'string' &&
      id.trim().length > 0 &&
      id.trim() !== 'your_vapi_assistant_id_here'
    ) {
      const trimmed = id.trim();
      if (!validIds.includes(trimmed)) {
        validIds.push(trimmed);
      }
    }
  }

  if (validIds.length === 0) {
    validIds.push('2ca26d7b-2466-433f-8201-8a9d2df26d1d');
  }

  return validIds;
}

export function resolveVapiPrivateKeys(): string[] {
  const envObj: Record<string, any> = {
    ...(typeof process !== 'undefined' ? process.env : {}),
    ...((import.meta as any).env || {}),
  };

  const rawKeys: (string | undefined)[] = [
    envObj.VAPI_PRIVATE_KEY,
    envObj.VAPI_PRIVATE_KEY_1,
    envObj.VAPI_PRIVATE_KEY_2,
    envObj.VAPI_PRIVATE_KEY_3,
    envObj.PRIVATE_VAPI_KEY,
    envObj.PRIVATE_VAPI_KEY_1,
    envObj.PRIVATE_VAPI_KEY_2,
  ];

  for (const [key, value] of Object.entries(envObj)) {
    if (
      /^(VAPI_PRIVATE_KEY|PRIVATE_VAPI_KEY)(_\d+)?$/i.test(key) &&
      typeof value === 'string'
    ) {
      rawKeys.push(value);
    }
  }

  const validKeys: string[] = [];
  for (const k of rawKeys) {
    if (
      typeof k === 'string' &&
      k.trim().length > 0 &&
      k.trim() !== 'your_vapi_private_key_here'
    ) {
      const trimmed = k.trim();
      if (!validKeys.includes(trimmed)) {
        validKeys.push(trimmed);
      }
    }
  }

  if (validKeys.length === 0) {
    validKeys.push('6e9cf281-960d-4057-b52c-f3a81650cb82');
  }

  return validKeys;
}

export function resolveVapiPublicKey(): string {
  return resolveVapiPublicKeys()[0];
}

export function resolveVapiAssistantId(): string {
  return resolveVapiAssistantIds()[0];
}

export function resolveVapiPrivateKey(): string {
  return resolveVapiPrivateKeys()[0];
}
