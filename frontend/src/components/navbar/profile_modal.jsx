import { Link } from 'react-router-dom';
import '../../stylesheets/profile_modal.css';
import { ImExit } from 'react-icons/im';
import React from 'react';

class ProfileModal extends React.Component {
    constructor(props) {
        super(props);
        this.handleViewProfile = this.handleViewProfile.bind(this);
        this.handleSignout = this.handleSignout.bind(this);
    }

    handleSignout() {
        this.props.toggleProfileModal();
        this.props.logout();
        this.props.history.push('/login');
    }

    handleViewProfile() {
        this.props.toggleProfileModal();
        this.props.history.push(`/users/${this.props.currentUser.id}`);
    }

    render() {
        return (
            <div>
                <div id="profile-modal-overlay" onClick={this.props.toggleProfileModal}></div>
                <div id="profile-modal">
                    <div id="profile-info-container">
                        <div id="profile-img-container">
                            <div id="profile-img">
                                {this.props.currentUser.firstName.slice(0,1)}
                            </div>
                        </div>
                        <div id="profile-info">
                            <p id="profile-name">
                                {`${this.props.currentUser.firstName} ${this.props.currentUser.lastName}`}
                            </p>
                            <p id="profile-skill">current user skill level goes here</p>
                        </div>
                    </div>
                    <div id="profile-modal-actions">
                        <button onClick={() => this.handleViewProfile()} id="view-profile">View Profile</button>
                        <button id="signout-btn" onClick={() => this.handleSignout()}><ImExit /> Sign Out</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default ProfileModal;