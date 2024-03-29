import ProfileSetting from './profileSetting';
import NoticeSetting from './noticeSetting';
import PasswordSetting from './passwordSetting';
import WithdrawalSetting from './withdrawalSetting';
import FilteringSetting from './filteringSetting';
import BlockSetting from './blockSetting';
import Credit from './credit';


//settingState로 가능한 것들 profile // Snotice // password // filtering // block
const LeftSetting = ({settingState, refreshAccessToken, userId, logout, setChatAndFriendReloadTriger, rightBookState}) => {
    return(
        <div>
            { settingState === 'profile' ? <ProfileSetting refreshAccessToken={refreshAccessToken} setChatAndFriendReloadTriger={setChatAndFriendReloadTriger} rightBookState={rightBookState}/> : null }
            { settingState === 'Snotice' ? <NoticeSetting refreshAccessToken={refreshAccessToken}/> : null }
            { settingState === 'password' ? <PasswordSetting refreshAccessToken={refreshAccessToken}/> :null }
            { settingState === 'withdrawal' ? <WithdrawalSetting refreshAccessToken={refreshAccessToken} logout={logout}/> :null }
            { settingState === 'filtering' ? <FilteringSetting refreshAccessToken={refreshAccessToken} userId={userId}/> : null }
            { settingState === 'block' ? <BlockSetting refreshAccessToken={refreshAccessToken} userId={userId}/> : null }
            { settingState === 'credit' ? <Credit /> : null }
        </div>
    );
}

export default LeftSetting;