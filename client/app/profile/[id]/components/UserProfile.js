import useAuth from '@/app/hooks/useAuth';
import { useEffect, useState } from 'react';
import Loader from '../../../components/loader/Loader';
import styles from './profile.module.css';
import { FaCamera } from 'react-icons/fa';
import { MdImage } from 'react-icons/md';

const UserProfile = ({ id }) => {
    const { isAuthenticated, user, setUser } = useAuth(); // Added setUser here
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState([]);
    const [userFound, setUserFound] = useState(false);
    const [selfProfile, setSelfProfile] = useState(false);
     // New state for editing bio
    const [bio, setBio] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isBannerModalOpen, setBannerModalOpen] = useState(false);
    const [foundPetsCount, setFoundPetsCount] = useState(0);
    const [badge, setBadge] = useState('');

    const predefinedBanners = [
        '/banners/banner1.jpg',
        '/banners/banner2.jpg',
        '/banners/banner3.jpg',
        '/banners/banner4.jpg',
        '/banners/banner5.jpg',
        '/banners/banner6.jpg',
    ];    

    useEffect(() => {
        if (user && user._id === id) {
            setSelfProfile(true);
            setUserFound(true);
            setBio(user.bio || '');
            setLoading(false);
        } else {
            fetchUser();
        }
    }, [id, user]);

    useEffect(() => {
        const fetchFoundPetsCount = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/${id}/found-count`
                );
                const data = await response.json();
                if (response.ok) {
                    setFoundPetsCount(data.count);
                } else {
                    console.error('Failed to fetch found pets count:', data.message);
                }
            } catch (error) {
                console.error('Error fetching found pets count:', error.message);
            }
        };
    
        fetchFoundPetsCount();
    }, [id]);

    const fetchUser = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/${id}`);
            const userInfo = await response.json();
            if (!response.ok) {
                throw new Error('User not found');
            }
            setUserFound(true);
            setUserData(userInfo);
            setBio(userInfo.bio || '');
            // Calculate account age in days
            const accountAgeInDays = (new Date() - new Date(userInfo.createdAt)) / (1000 * 60 * 60 * 24);

            // Determine badge based on account age
            if (accountAgeInDays <= 30) {
                setBadge('Newbie'); // Newbie badge for accounts less than or equal to 30 days old
            } else if (accountAgeInDays <= 180) {
                setBadge('Explorer'); // Explorer badge for accounts between 31 and 180 days
            } else {
                setBadge('Veteran'); // Veteran badge for accounts older than 180 days
            }
        } catch (error) {
            console.log('Error fetching user:', error);
            setUserFound(false);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);

            try {
                console.log("Starting image upload...");
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/profile/upload-profile-image`, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }

                const result = await response.json();
                console.log("Uploaded Image URL:", result.profileImage);

                // Update the user state in useAuth to ensure the profile image persists
                setUser((prevUser) => ({
                    ...prevUser,
                    profileImage: result.profileImage,
                }));

                // Update local userData for immediate effect
                setUserData((prevData) => ({
                    ...prevData,
                    profileImage: result.profileImage,
                }));
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }
    };

    const handleBioSave = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // To send cookies
                body: JSON.stringify({ bio }),
            });

            if (!response.ok) {
                throw new Error('Failed to update bio');
            }

            const updatedUser = await response.json();
            setUser((prevUser) => ({
                ...prevUser,
                bio: updatedUser.user.bio,
            }));
            setUserData((prevData) => ({
                ...prevData,
                bio: updatedUser.user.bio,
            }));
            setIsEditing(false); // Exit editing mode
        } catch (error) {
            console.error('Error updating bio:', error);
        }
    };

    const handleBannerClick = async (bannerUrl) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/banner`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ banner: bannerUrl }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to update banner');
            }
    
            const data = await response.json();
    
            // Update both user and userData states immediately
            setUser((prevUser) => ({ ...prevUser, banner: data.banner }));
            setUserData((prevData) => ({ ...prevData, banner: data.banner }));
            setBannerModalOpen(false); // Close the modal
        } catch (error) {
            console.error('Error updating banner:', error);
        }
    };    
    
    if (loading) {
        return <Loader />;
    }

    if (!userFound) {
        return (
            <div>
                <h1>No user exists</h1>
            </div>
        );
    }

    return (
        <div className={styles.profileBackground}>
            <div className={styles.profileContainer}>
                <div
                    className={styles.profileBanner}
                    style={{ backgroundImage: `url(${userData.banner || '/background-stray5.jpg'})` }}
                >
                    {/* Only show the banner change icon for the user's own profile */}
                    {selfProfile && (
                        <>
                            <button
                                className={styles.bannerChangeIcon}
                                onClick={() => setBannerModalOpen(true)}
                            >
                                <MdImage />
                            </button>

                            {isBannerModalOpen && (
                                <div className={styles.bannerModal}>
                                    <div className={styles.bannerGrid}>
                                        {predefinedBanners.map((banner, index) => (
                                            <img
                                                key={index}
                                                src={banner}
                                                className={styles.bannerPreview}
                                                onClick={() => handleBannerClick(banner)}
                                                alt={`Banner ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                    <button onClick={() => setBannerModalOpen(false)} className={styles.closeModal}>
                                        Close
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Profile Image and Camera Icon */}
                <div className={styles.profileImageContainer}>
                    <img
                        src={(selfProfile ? user.profileImage : userData.profileImage) || '/no_pfp.jpg'}
                        alt={`${userData.username || user.username}'s profile`}
                        className={styles.profileImage}
                    />
                    {selfProfile && (
                        <div className={styles.cameraIcon} onClick={() => document.getElementById('fileInput').click()}>
                            <FaCamera />
                        </div>
                    )}
                </div>
                
                <input
                    type="file"
                    id="fileInput"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />

                {/* Username */}
                <h2 className={styles.userName}>{userData.username || user.username}</h2>

                {/* Profile Details (About Me, Achievements, and Stats) */}
                <div className={styles.profileDetails}>
                    {/* About Me Section */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>About Me</h2>
                        {selfProfile && isEditing ? (
                            <div>
                                <textarea
                                    className={styles.bioInput}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    maxLength={500}
                                    placeholder="Write something about yourself..."
                                ></textarea>
                                <button className={styles.saveButton} onClick={handleBioSave}>
                                    Save
                                </button>
                                <button
                                    className={styles.cancelButton}
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <p className={styles.cardText}>{bio || "Add a bio to tell others about yourself!"}</p>
                        )}
                        {selfProfile && !isEditing && (
                            <button
                                className={styles.editButton}
                                onClick={() => setIsEditing(true)}
                            >
                                Edit Bio
                            </button>
                        )}
                    </div>

                    {/* Achievements Section */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Achievements</h2>
                        <div className={styles.badges}>
                            {/* Badge based on account age */}
                            {badge === 'Newbie' && (
                                <span className={styles.badge}>
                                    <i className={styles.badgeIcon}>🌟</i> Newbie
                                </span>
                            )}
                            {badge === 'Explorer' && (
                                <span className={styles.badge}>
                                    <i className={styles.badgeIcon}>🧭</i> Explorer
                                </span>
                            )}
                            {badge === 'Veteran' && (
                                <span className={styles.badge}>
                                    <i className={styles.badgeIcon}>🏆</i> Veteran
                                </span>
                            )}

                            {/* Helper badge for users with at least one found pet */}
                            {foundPetsCount > 0 && (
                                <span className={styles.badge}>
                                    <i className={styles.badgeIcon}>🐾</i> Helper
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Profile Stats Section */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Profile Stats</h2>
                        <div className={styles.stats}>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>{foundPetsCount}</span>
                                <span className={styles.statLabel}>Strays Found</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>80%</span>
                                <span className={styles.statLabel}>Profile Completion</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
