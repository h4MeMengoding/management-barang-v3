import Image from 'next/image';
import { Camera, Eye, EyeOff, Save, Loader2 } from 'lucide-react';

interface ProfileSectionProps {
  formData: {
    fullName: string;
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  profileImage: string | null;
  isLoading: boolean;
  isUploadingImage: boolean;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleCurrentPassword: () => void;
  onToggleNewPassword: () => void;
  onToggleConfirmPassword: () => void;
}

export default function ProfileSection({
  formData,
  profileImage,
  isLoading,
  isUploadingImage,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  onFormChange,
  onImageUpload,
  onSubmit,
  onToggleCurrentPassword,
  onToggleNewPassword,
  onToggleConfirmPassword,
}: ProfileSectionProps) {
  return (
    <div className="bg-[var(--surface-1)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
      <div className="p-6 border-b border-[var(--divider)] bg-[var(--color-primary)]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
            <Save className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Profil & Keamanan</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Update informasi pribadi dan password Anda
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--surface-2)] rounded-xl p-6 border border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 text-center">
                Foto Profil
              </h3>

              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-[var(--surface-3)] mb-4 group cursor-pointer shadow-lg ring-4 ring-[var(--surface-1)]">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt="Profile"
                      fill
                      sizes="128px"
                      priority
                      className="object-cover"
                      onError={() => {}}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--color-primary)]">
                      <span className="text-4xl font-bold text-white">
                        {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                  )}

                  <label
                    htmlFor="profile-upload"
                    className={`absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all ${
                      isUploadingImage ? 'cursor-wait' : 'cursor-pointer'
                    } flex items-center justify-center`}
                  >
                    {isUploadingImage ? (
                      <Loader2 className="text-white animate-spin" size={32} />
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2">
                        <Camera className="text-white" size={32} />
                        <span className="text-xs text-white font-medium">Upload Foto</span>
                      </div>
                    )}
                    <input
                      type="file"
                      id="profile-upload"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={onImageUpload}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                <p className="text-xs text-[var(--text-secondary)] text-center">
                  {isUploadingImage ? (
                    <span className="text-[var(--color-primary)] font-semibold">Uploading...</span>
                  ) : (
                    <>
                      JPG, PNG, WebP (Max 2MB)
                      <br />
                      <span className="text-[var(--text-tertiary)]">Klik untuk upload</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-semibold text-[var(--text-primary)] mb-2"
                  >
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={onFormChange}
                    placeholder="Masukkan nama lengkap"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all disabled:bg-[var(--surface-2)] disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-[var(--text-primary)] mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={onFormChange}
                    placeholder="email@example.com"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all disabled:bg-[var(--surface-2)] disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--divider)]"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-[var(--surface-1)] text-xs font-semibold text-[var(--text-secondary)]">
                    Ubah Password (Opsional)
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-xs font-semibold text-[var(--text-primary)] mb-2"
                  >
                    Password Saat Ini
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={onFormChange}
                      placeholder="Masukkan password saat ini"
                      className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={onToggleCurrentPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-xs font-semibold text-[var(--text-primary)] mb-2"
                    >
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={onFormChange}
                        placeholder="Min. 8 karakter"
                        minLength={8}
                        className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={onToggleNewPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-semibold text-[var(--text-primary)] mb-2"
                    >
                      Konfirmasi Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={onFormChange}
                        placeholder="Ulangi password baru"
                        className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={onToggleConfirmPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
