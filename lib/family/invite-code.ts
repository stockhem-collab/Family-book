// Utan lättförväxlade tecken (0/O, 1/I) eftersom koden ofta skrivs av för hand.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function generateInviteCode(length = 6) {
  let code = ""
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return code
}
