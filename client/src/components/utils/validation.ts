export const validateMobileNumber = (mobileNumber: string): boolean => {
    const mobileRegex = /^\d{10}$/;
    return mobileRegex.test(mobileNumber);
  };
  