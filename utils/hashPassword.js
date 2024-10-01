import bcrypt from 'bcrypt';


export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    return hashPassword

}

export  const comparePassword = async (password, hashPassword) => {
    return await bcrypt.compare(password, hashPassword)
}

