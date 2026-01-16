export const getSubdomain = () => {
  const hostname = window.location.hostname;
  
  // Handle localhost for testing
  // e.g. admin.localhost:5173 or just localhost (main)
  // Note: Localhost usually doesn't work with subdomains without /etc/hosts changes.
  // We will assume production domains mainly: admin.bharakt.in
  
  const parts = hostname.split('.');
  
  // If localhost or simple domain (e.g. localhost:5173), parts length is 1 (or 2 if .com)
  // Standard domain: sub.domain.com -> 3 parts
  // Our case: admin.bharakt.in -> 3 parts
  // bharakt.in -> 2 parts
  
  // We can just check if the first part matches our known roles
  if (parts.length >= 2) {
    const sub = parts[0];
    if (sub === 'admin') return 'admin';
    if (sub === 'ngo') return 'ngo';
    if (sub === 'bloodbank') return 'blood_bank'; // Mapping 'bloodbank' subdomain to 'blood_bank' role
    if (sub === 'www') return 'main'; // Treat www as main
  }
  
  return 'main';
};

export const getAppMode = () => {
    return getSubdomain();
};
