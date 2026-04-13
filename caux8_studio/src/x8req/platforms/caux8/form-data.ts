type FormValue = string | number | boolean;

export function appendFields(
  form: FormData,
  values: object,
  options?: {
    keyTransform?: (key: string) => string;
  }
): FormData {
  const keyTransform = options?.keyTransform ?? ((key: string) => key);

  for (const [key, value] of Object.entries(values as Record<string, FormValue>)) {
    form.append(keyTransform(key), String(value));
  }

  return form;
}

export function appendIndexedFields(
  form: FormData,
  values: object[]
): FormData {
  values.forEach((entry, index) => {
    for (const [key, value] of Object.entries(
      entry as Record<string, FormValue>
    )) {
      form.append(`${key}[${index}]`, String(value));
    }
  });

  return form;
}
