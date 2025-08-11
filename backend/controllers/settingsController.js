const Settings = require('../models/Settings');

// Get system settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getInstance();
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching settings' 
    });
  }
};

// Update system settings
exports.updateSettings = async (req, res) => {
  try {
    const settings = await Settings.getInstance();
    
    // Update settings with provided data
    Object.keys(req.body).forEach(key => {
      if (settings.schema.paths[key]) {
        settings[key] = req.body[key];
      }
    });

    // Set who updated the settings
    settings.updatedBy = req.user.id;
    
    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating settings' 
    });
  }
};

// Reset settings to defaults
exports.resetSettings = async (req, res) => {
  try {
    // Remove existing settings
    await Settings.deleteMany({});
    
    // Create new default settings
    const settings = new Settings();
    settings.updatedBy = req.user.id;
    await settings.save();

    res.json({
      success: true,
      message: 'Settings reset to defaults successfully',
      settings
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error resetting settings' 
    });
  }
};

// Get public settings (for frontend configuration)
exports.getPublicSettings = async (req, res) => {
  try {
    const settings = await Settings.getInstance();
    
    // Only return settings that are safe to expose publicly
    const publicSettings = {
      schoolName: settings.schoolName,
      schoolAddress: settings.schoolAddress,
      schoolContactNumber: settings.schoolContactNumber,
      schoolEmail: settings.schoolEmail,
      academicYear: settings.academicYear,
      semester: settings.semester,
      documentProcessingDays: settings.documentProcessingDays,
      maxRequestsPerUser: settings.maxRequestsPerUser,
      enableQRCodes: settings.enableQRCodes,
      enableAIProcessing: settings.enableAIProcessing,
      enableChatbot: settings.enableChatbot,
      requireEmailVerification: settings.requireEmailVerification,
      passwordMinLength: settings.passwordMinLength,
      requireStrongPasswords: settings.requireStrongPasswords,
    };

    res.json({
      success: true,
      settings: publicSettings
    });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching public settings' 
    });
  }
};
