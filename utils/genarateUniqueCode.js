const generateUniqueCode = (n=6) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < n; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };


  export default generateUniqueCode