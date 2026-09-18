"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, ShieldCheck, Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import ProfileImagePicker from "@/components/ProfileImagePicker";

export default function ProfilePage() {
  const { t, hydrated, user, updateProfile } = useApp();
  const router = useRouter();

  const [name, setName] = useState(user?.name ?? "");
  const [district, setDistrict] = useState(user?.district ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [profileImage, setProfileImage] = useState(user?.profileImage ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setDistrict(user.district ?? "");
    setPhone(user.phone ?? "");
    setBio(user.bio ?? "");
    setProfileImage(user.profileImage ?? "");
  }, [user]);

  if (!hydrated) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <div className="h-14 w-14 mx-auto mb-4 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-5 w-40 mx-auto mb-2 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-56 mx-auto rounded bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <Lock size={32} />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in required</h2>
        <a
          href="/signin?redirect=/account/profile"
          className="block mt-4 py-4 bg-brand-700 text-white font-bold rounded-xl text-center"
        >
          Sign In
        </a>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !district) return;
    const success = await updateProfile({
      ...user,
      name: name.trim(),
      district,
      phone: phone.trim(),
      bio: bio.trim(),
      profileImage,
    });
    if (!success) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="sticky top-0 md:top-16 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-brand-700">
          <ArrowLeft size={22} />
        </button>
        <h2 className="font-bold text-gray-900">{t.profile}</h2>
      </div>

      <div className="px-4 py-6">
        <div className="mb-8">
          <ProfileImagePicker
            image={profileImage}
            name={name || user.name}
            onChange={(nextImage) => setProfileImage(nextImage ?? "")}
          />
          <p className="text-sm text-gray-500">{user.email}</p>
          {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {t.nameLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {t.email}
            </label>
            <div className="input-field bg-gray-100 text-gray-500 cursor-not-allowed">
              {user.email}
            </div>
          </div>

          <label className="block text-sm font-semibold text-gray-700">
            {t.phoneNumber}
            <input type="tel" autoComplete="tel" maxLength={100} className="input-field mt-1.5" value={phone} onChange={e => setPhone(e.target.value)} />
          </label>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {t.districtLabel} <span className="text-red-500">*</span>
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="input-field"
            >
              <option value="">Select district...</option>
              {t.districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Farm description
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-field resize-none"
              rows={4}
              placeholder="A short, simple description of your farm."
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !district}
            className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <CheckCircle size={18} />
                Saved!
              </>
            ) : (
              t.save
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
