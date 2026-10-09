// DEMO ONLY. Real apps hash on the server (bcrypt/argon2) and use httpOnly cookies.
async function sha256(txt){
  const data = new TextEncoder().encode(txt)
  const hash = await crypto.subtle.digest('SHA-256',data)
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('')
}
async function getUsers(){
  try{ return JSON.parse(localStorage.getItem('users')||'[]') }catch{ return [] }
}
async function saveUsers(users){ try{ localStorage.setItem('users',JSON.stringify(users)) }catch{} }

export async function signupUser(name,email,password){
  const users = await getUsers()
  if(users.find(u=>u.email.toLowerCase()===email.toLowerCase())) throw new Error('User exists')
  const salt = Math.random().toString(36).slice(2)
  const hash = await sha256(salt+password)
  const user = {name,email,salt,passwordHash:hash}
  users.push(user); await saveUsers(users)
  try{ localStorage.setItem('session',JSON.stringify({name,email})) }catch{}
  return user
}
export async function loginUser(email,password){
  const users = await getUsers()
  const u = users.find(x=>x.email.toLowerCase()===email.toLowerCase())
  if(!u) throw new Error('Invalid email or password')
  const hash = await sha256(u.salt+password)
  if(hash!==u.passwordHash) throw new Error('Invalid email or password')
  try{ localStorage.setItem('session',JSON.stringify({name:u.name,email:u.email})) }catch{}
  return u
}
