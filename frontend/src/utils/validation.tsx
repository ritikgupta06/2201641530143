export const validateUrl = (url: string): boolean => {
  try {
    const urlPattern = /^https?:\/\/.+\..+/;
    return urlPattern.test(url);
  } catch (error) {
    return false;
  }
};

export const validateShortcode = (shortcode: string): boolean => {
  // Alphanumeric characters, 4-10 characters long
  const shortcodePattern = /^[a-zA-Z0-9]{4,10}$/;
  return shortcodePattern.test(shortcode);
};

export const validateValidity = (validity: number): boolean => {
  return Number.isInteger(validity) && validity > 0;
};