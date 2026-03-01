-- HARD DELETE DATA IN DATABASE AFTER 90 DAYS
CREATE OR REPLACE FUNCTION hard_delete_data()
RETURNS VOID AS $$
BEGIN
    -- GET ALL URL IMAGE IN CLOUDINARY TO REMOVE ON CLOUD
    -- 
    DELETE FROM Notification WHERE userId = "";
    
    DELETE FROM USER WHERE id = "";
    
    DELETE FROM DriverVerification WHERE userId = "";
    
    DELETE Vehicle
    
    DELETE Route
    
    DELETE Booking
END