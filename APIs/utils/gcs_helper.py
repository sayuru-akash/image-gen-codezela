# utils/gcs_helper.py
import logging
import os
from datetime import datetime, timedelta

from google.cloud import storage
from google.cloud.exceptions import GoogleCloudError

logger = logging.getLogger(__name__)

def check_bucket_uniform_access(bucket_name: str) -> bool:
    """
    Check if bucket has uniform bucket-level access enabled
    
    Args:
        bucket_name: GCS bucket name
        
    Returns:
        bool: True if uniform access is enabled, False otherwise
    """
    try:
        credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if not credentials_path:
            raise ValueError("GOOGLE_APPLICATION_CREDENTIALS not set")

        storage_client = storage.Client.from_service_account_json(credentials_path)
        bucket = storage_client.bucket(bucket_name)
        bucket.reload()
        
        # Check if uniform bucket-level access is enabled
        uniform_access = bucket.iam_configuration.uniform_bucket_level_access_enabled
        logger.info(f"Bucket {bucket_name} uniform access enabled: {uniform_access}")
        return uniform_access
        
    except Exception as e:
        logger.error(f"Error checking bucket uniform access: {e}")
        # Assume uniform access is enabled to be safe
        return True

def upload_image_to_gcs(image_data: bytes, destination_blob_name: str, bucket_name: str) -> str:
    """
    Upload image data to Google Cloud Storage and return public URL
    
    Args:
        image_data: Raw image bytes
        destination_blob_name: Path/name for the blob in GCS
        bucket_name: GCS bucket name
        
    Returns:
        str: Public URL of the uploaded image
        
    Raises:
        Exception: If upload fails
    """
    try:
        # Get credentials path from environment variable
        credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if not credentials_path:
            raise ValueError("GOOGLE_APPLICATION_CREDENTIALS not set")

        # Validate inputs
        if not image_data:
            raise ValueError("Image data is empty")
        if not destination_blob_name:
            raise ValueError("Destination blob name is required")
        if not bucket_name:
            raise ValueError("Bucket name is required")

        # Initialize GCS client
        storage_client = storage.Client.from_service_account_json(credentials_path)
        bucket = storage_client.bucket(bucket_name)

        # Create blob and upload
        blob = bucket.blob(destination_blob_name)
        blob.upload_from_string(
            image_data, 
            content_type='image/png',
            timeout=300  # 5 minute timeout
        )

        # Check if uniform bucket-level access is enabled
        try:
            bucket.reload()
            uniform_access_enabled = bucket.iam_configuration.uniform_bucket_level_access_enabled
        except Exception:
            # If we can't check, assume it's enabled
            uniform_access_enabled = True

        if uniform_access_enabled:
            # For uniform bucket-level access, files are public if bucket allows public access
            # Return the public URL directly (bucket must be configured for public access)
            public_url = f"https://storage.googleapis.com/{bucket_name}/{destination_blob_name}"
            logger.info(f"Image uploaded to GCS (uniform access): {destination_blob_name}")
            logger.info(f"Public URL: {public_url}")
            
            # Note: For this to work, your bucket needs to have public access configured
            # at the bucket level via IAM (allUsers with Storage Object Viewer role)
            
        else:
            # Legacy ACL method - make individual file public
            try:
                blob.make_public()
                public_url = blob.public_url
                logger.info(f"Image uploaded to GCS (legacy ACL): {destination_blob_name}")
            except Exception as acl_error:
                logger.warning(f"Could not make blob public via ACL: {acl_error}")
                # Fall back to direct URL
                public_url = f"https://storage.googleapis.com/{bucket_name}/{destination_blob_name}"

        return public_url

    except GoogleCloudError as gcs_error:
        logger.error(f"GCS specific error: {gcs_error}")
        raise Exception(f"GCS upload failed: {gcs_error}")
    except Exception as e:
        logger.error(f"Failed to upload image to GCS: {type(e).__name__} - {e}")
        raise


def upload_image_to_gcs_with_signed_url(image_data: bytes, destination_blob_name: str, bucket_name: str, expiration_hours: int = 24) -> dict:
    """
    Upload image data to Google Cloud Storage and return signed URL (works with any bucket configuration)
    
    Args:
        image_data: Raw image bytes
        destination_blob_name: Path/name for the blob in GCS
        bucket_name: GCS bucket name
        expiration_hours: Hours until signed URL expires (default: 24)
        
    Returns:
        dict: Contains 'signed_url', 'blob_name', 'expires_at'
        
    Raises:
        Exception: If upload fails
    """
    try:
        credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if not credentials_path:
            raise ValueError("GOOGLE_APPLICATION_CREDENTIALS not set")

        # Validate inputs
        if not image_data:
            raise ValueError("Image data is empty")
        if not destination_blob_name:
            raise ValueError("Destination blob name is required")
        if not bucket_name:
            raise ValueError("Bucket name is required")

        # Initialize GCS client
        storage_client = storage.Client.from_service_account_json(credentials_path)
        bucket = storage_client.bucket(bucket_name)

        # Create blob and upload
        blob = bucket.blob(destination_blob_name)
        blob.upload_from_string(
            image_data, 
            content_type='image/png',
            timeout=300
        )

        # Generate signed URL
        expiration_time = datetime.utcnow() + timedelta(hours=expiration_hours)
        signed_url = blob.generate_signed_url(
            expiration=expiration_time,
            method='GET'
        )

        logger.info(f"Image uploaded to GCS with signed URL: {destination_blob_name}")
        
        return {
            'signed_url': signed_url,
            'blob_name': destination_blob_name,
            'expires_at': expiration_time.isoformat(),
            'bucket_name': bucket_name
        }

    except GoogleCloudError as gcs_error:
        logger.error(f"GCS specific error: {gcs_error}")
        raise Exception(f"GCS upload failed: {gcs_error}")
    except Exception as e:
        logger.error(f"Failed to upload image to GCS: {type(e).__name__} - {e}")
        raise


def configure_bucket_for_public_access(bucket_name: str) -> bool:
    """
    Configure bucket for public read access (requires admin permissions)
    
    Args:
        bucket_name: GCS bucket name
        
    Returns:
        bool: True if configuration successful
    """
    try:
        credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if not credentials_path:
            raise ValueError("GOOGLE_APPLICATION_CREDENTIALS not set")

        storage_client = storage.Client.from_service_account_json(credentials_path)
        bucket = storage_client.bucket(bucket_name)

        # Get current IAM policy
        policy = bucket.get_iam_policy(requested_policy_version=3)

        # Add public read access
        policy.bindings.append({
            "role": "roles/storage.objectViewer",
            "members": {"allUsers"}
        })

        # Set the updated policy
        bucket.set_iam_policy(policy)
        
        logger.info(f"Bucket {bucket_name} configured for public access")
        return True
        
    except Exception as e:
        logger.error(f"Failed to configure bucket for public access: {e}")
        return False


def delete_image_from_gcs(blob_name: str, bucket_name: str) -> bool:
    """
    Delete an image from Google Cloud Storage
    
    Args:
        blob_name: Name/path of the blob to delete
        bucket_name: GCS bucket name
        
    Returns:
        bool: True if deleted successfully, False otherwise
    """
    try:
        credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if not credentials_path:
            raise ValueError("GOOGLE_APPLICATION_CREDENTIALS not set")

        storage_client = storage.Client.from_service_account_json(credentials_path)
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        
        blob.delete()
        logger.info(f"Image deleted from GCS: {blob_name}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to delete image from GCS: {type(e).__name__} - {e}")
        return False


def get_bucket_info(bucket_name: str) -> dict:
    """
    Get information about the bucket configuration
    
    Args:
        bucket_name: GCS bucket name
        
    Returns:
        dict: Bucket configuration info
    """
    try:
        credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if not credentials_path:
            raise ValueError("GOOGLE_APPLICATION_CREDENTIALS not set")

        storage_client = storage.Client.from_service_account_json(credentials_path)
        bucket = storage_client.bucket(bucket_name)
        bucket.reload()

        uniform_access = bucket.iam_configuration.uniform_bucket_level_access_enabled
        
        return {
            'bucket_name': bucket_name,
            'uniform_bucket_level_access': uniform_access,
            'location': bucket.location,
            'storage_class': bucket.storage_class,
            'created': bucket.time_created.isoformat() if bucket.time_created else None
        }
        
    except Exception as e:
        logger.error(f"Failed to get bucket info: {e}")
        return {'error': str(e)}