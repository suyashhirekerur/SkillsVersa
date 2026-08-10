import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Lock, 
  GraduationCap, 
  Zap, 
  MapPin, 
  Mail, 
  Phone,
  Camera, 
  Plus, 
  Trash2, 
  Star, 
  BookOpen, 
  ShieldCheck, 
  Save, 
  Link as LinkIcon,
  Eye,
  EyeOff
} from 'lucide-react';

export default function ProfilePage() {
  const { user, setTokenAndFetchUser } = useAuth();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState('general');

  // General Profile State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Skills State
  const [skillsToTeach, setSkillsToTeach] = useState([]);
  const [skillsToLearn, setSkillsToLearn] = useState([]);
  const [newTeachName, setNewTeachName] = useState('');
  const [newTeachCategory, setNewTeachCategory] = useState('Development');
  const [newTeachProficiency, setNewTeachProficiency] = useState('intermediate');
  const [newLearnName, setNewLearnName] = useState('');
  const [newLearnCategory, setNewLearnCategory] = useState('Development');
  const [isSavingSkills, setIsSavingSkills] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setCountryCode(user.countryCode || '+1');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setAvatar(user.avatar || '');
      
      const teachList = user.skillsToTeach || user.skills?.teach || [];
      const learnList = user.skillsToLearn || user.skills?.learn || [];

      setSkillsToTeach(teachList.map(s => typeof s === 'string' ? { name: s, category: 'General', proficiency: 'intermediate' } : s));
      setSkillsToLearn(learnList.map(s => typeof s === 'string' ? { name: s, category: 'General' } : s));
    }
  }, [user]);

  // Sync user state with backend
  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await setTokenAndFetchUser(token);
    }
  };

  // Avatar Upload Handler (File)
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, JPEG)');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploadingAvatar(true);
    try {
      const res = await api.put('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAvatar(res.data.data.avatar);
      await refreshUser();
      toast.success('Avatar uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Profile Form Submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await api.put('/users/profile', { name, bio, location, avatar, phone, countryCode });
      await refreshUser();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Add Skill to Teach
  const handleAddTeachSkill = (e) => {
    e.preventDefault();
    if (!newTeachName.trim()) {
      toast.error('Please enter a skill name');
      return;
    }
    setSkillsToTeach([...skillsToTeach, { name: newTeachName.trim(), category: newTeachCategory, proficiency: newTeachProficiency }]);
    setNewTeachName('');
  };

  // Remove Skill to Teach
  const handleRemoveTeachSkill = (index) => {
    setSkillsToTeach(skillsToTeach.filter((_, i) => i !== index));
  };

  // Add Skill to Learn
  const handleAddLearnSkill = (e) => {
    e.preventDefault();
    if (!newLearnName.trim()) {
      toast.error('Please enter a skill name');
      return;
    }
    setSkillsToLearn([...skillsToLearn, { name: newLearnName.trim(), category: newLearnCategory }]);
    setNewLearnName('');
  };

  // Remove Skill to Learn
  const handleRemoveLearnSkill = (index) => {
    setSkillsToLearn(skillsToLearn.filter((_, i) => i !== index));
  };

  // Save All Skills
  const handleSkillsSubmit = async (e) => {
    e.preventDefault();
    setIsSavingSkills(true);
    try {
      await api.put('/users/skills', {
        skillsToTeach,
        skillsToLearn
      });
      await refreshUser();
      toast.success('Skills updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to save skills');
    } finally {
      setIsSavingSkills(false);
    }
  };

  // Change Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.put('/users/password', { currentPassword, newPassword });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'My Profile', icon: User },
    { id: 'security', label: 'Change Password', icon: Lock },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-purple-900/80 via-gray-900/90 to-rose-900/80 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl mb-8 overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 relative z-10">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary-900/80 border-4 border-white/20 overflow-hidden shadow-xl flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-primary-400">{user?.name?.charAt(0) || 'U'}</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110">
              <Camera size={16} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} disabled={isUploadingAvatar} />
            </label>
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-3xl font-extrabold text-white flex items-center justify-center sm:justify-start space-x-2">
              <span>{user?.name}</span>
              <span className="text-xs bg-primary-500/20 border border-primary-400/30 text-primary-300 px-3 py-1 rounded-full font-medium capitalize">
                {user?.role || 'Member'}
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <span className="flex items-center space-x-1"><Mail size={14} /> <span>{user?.email}</span></span>
              {(user?.phone || phone) && (
                <span className="flex items-center space-x-1"><Phone size={14} /> <span>{user?.countryCode || countryCode} {user?.phone || phone}</span></span>
              )}
              {location && <span className="flex items-center space-x-1"><MapPin size={14} /> <span>{location}</span></span>}
            </p>
            <p className="text-gray-300 text-sm mt-3 max-w-xl italic">
              {user?.bio ? `"${user.bio}"` : 'No bio added yet. Add a short bio to introduce yourself!'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center shadow-inner">
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Skill Credits</div>
            <div className="text-2xl font-black text-amber-400 flex items-center justify-center space-x-1 mt-1">
              <Zap size={20} className="fill-amber-400 text-amber-400" />
              <span>{user?.credits || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-white/10 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' 
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'general' && (
          <motion.div key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <form onSubmit={handleProfileSubmit} className="bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <User className="text-primary-400" />
                <span>General Profile Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    placeholder="Your Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address (Read-only)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 text-gray-500" size={18} />
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Country Code</label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  >
                    <option value="+1">🇺🇸/🇨🇦 +1 (US/Canada)</option>
                    <option value="+91">🇮🇳 +91 (India)</option>
                    <option value="+44">🇬🇧 +44 (UK)</option>
                    <option value="+61">🇦🇺 +61 (Australia)</option>
                    <option value="+49">🇩🇪 +49 (Germany)</option>
                    <option value="+33">🇫🇷 +33 (France)</option>
                    <option value="+81">🇯🇵 +81 (Japan)</option>
                    <option value="+86">🇨🇳 +86 (China)</option>
                    <option value="+971">🇦🇪 +971 (UAE)</option>
                    <option value="+55">🇧🇷 +55 (Brazil)</option>
                    <option value="+27">🇿🇦 +27 (South Africa)</option>
                    <option value="+7">🇷🇺 +7 (Russia)</option>
                    <option value="+65">🇸🇬 +65 (Singapore)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 text-gray-500" size={18} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 text-gray-500" size={18} />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    placeholder="e.g. New York, USA or Remote"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Avatar URL (Direct Image Link)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-3.5 text-gray-500" size={18} />
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    placeholder="https://example.com/my-photo.jpg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">You can also upload an image using the camera icon on your avatar image above.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio / Tagline</label>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  placeholder="Share a short intro about your passion, skills, or what you love to learn..."
                />
                <div className="text-right text-xs text-gray-500 mt-1">{bio.length}/500</div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Save size={18} />
                  <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === 'skills' && (
          <motion.div key="skills" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <form onSubmit={handleSkillsSubmit} className="space-y-8">
              {/* Skills I Can Teach */}
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <GraduationCap className="text-emerald-400" />
                  <span>Skills I Can Teach</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newTeachName}
                    onChange={(e) => setNewTeachName(e.target.value)}
                    placeholder="Skill name (e.g. React, French)"
                    className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                  <select
                    value={newTeachCategory}
                    onChange={(e) => setNewTeachCategory(e.target.value)}
                    className="px-4 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Language">Language</option>
                    <option value="Music">Music</option>
                    <option value="Business">Business</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="flex space-x-2">
                    <select
                      value={newTeachProficiency}
                      onChange={(e) => setNewTeachProficiency(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddTeachSkill}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded-xl flex items-center justify-center transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {skillsToTeach.map((skill, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-3.5 py-1.5 rounded-xl text-sm">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-xs text-emerald-400/70 bg-emerald-900/50 px-2 py-0.5 rounded-full capitalize">{skill.proficiency || 'intermediate'}</span>
                      <button type="button" onClick={() => handleRemoveTeachSkill(index)} className="text-emerald-400 hover:text-rose-400 transition-colors ml-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {skillsToTeach.length === 0 && (
                    <p className="text-sm text-gray-500">No teaching skills added yet.</p>
                  )}
                </div>
              </div>

              {/* Skills I Want to Learn */}
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <BookOpen className="text-blue-400" />
                  <span>Skills I Want to Learn</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newLearnName}
                    onChange={(e) => setNewLearnName(e.target.value)}
                    placeholder="Skill name (e.g. Python, Guitar)"
                    className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <select
                    value={newLearnCategory}
                    onChange={(e) => setNewLearnCategory(e.target.value)}
                    className="px-4 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Language">Language</option>
                    <option value="Music">Music</option>
                    <option value="Business">Business</option>
                    <option value="Other">Other</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddLearnSkill}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl flex items-center justify-center space-x-1 text-sm font-medium transition-colors"
                  >
                    <Plus size={18} />
                    <span>Add Skill</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {skillsToLearn.map((skill, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-blue-950/60 border border-blue-500/30 text-blue-300 px-3.5 py-1.5 rounded-xl text-sm">
                      <span className="font-medium">{skill.name}</span>
                      <button type="button" onClick={() => handleRemoveLearnSkill(index)} className="text-blue-400 hover:text-rose-400 transition-colors ml-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {skillsToLearn.length === 0 && (
                    <p className="text-sm text-gray-500">No learning skills added yet.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingSkills}
                  className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Save size={18} />
                  <span>{isSavingSkills ? 'Saving Skills...' : 'Save All Skills'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <form onSubmit={handlePasswordSubmit} className="bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6 max-w-xl mx-auto">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Lock className="text-primary-400" />
                <span>Change Account Password</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                      title={showCurrentPassword ? "Hide password" : "Show password"}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">New Password (min. 6 characters)</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                      title={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Lock size={18} />
                  <span>{isChangingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                  <Zap size={24} />
                </div>
                <div className="text-3xl font-black text-white">{user?.credits || 0}</div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">Active Skill Credits</div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center mx-auto mb-3">
                  <Star size={24} />
                </div>
                <div className="text-3xl font-black text-white">{user?.averageRating || '5.0'}</div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">Average Peer Rating</div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
                  <BookOpen size={24} />
                </div>
                <div className="text-3xl font-black text-white">{user?.totalReviews || 0}</div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">Completed Reviews</div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck size={24} />
                </div>
                <div className="text-3xl font-black text-white capitalize">{user?.role || 'User'}</div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">Account Role</div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-2">How Skill Credits Work</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Skill credits allow you to request learning sessions with expert peers. You earn credits whenever you host a teaching session for someone else!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
