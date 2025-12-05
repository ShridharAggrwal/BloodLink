const { v4: uuidv4 } = require('uuid');

const generateToken = () => {
  return uuidv4();
};

const getExpiryDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const validateBloodGroup = (bloodGroup) => {
  return BLOOD_GROUPS.includes(bloodGroup);
};

module.exports = {
  generateToken,
  getExpiryDate,
  BLOOD_GROUPS,
  validateBloodGroup,
};

