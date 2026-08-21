
function presentPengguna(user) {
  if (!user) return null;

  return {
    id: user.id,
    nama: user.nama,
    username: user.username,
    unit: user.unit || 'ARFF YIA',
    regu: user.regu || null,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

module.exports = { presentPengguna };
