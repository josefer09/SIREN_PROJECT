export interface StorageAdapterInterface {
  /**
   * Upload a file buffer to storage
   * @param file - File buffer
   * @param filename - Desired filename (without path)
   * @param folder - Subfolder to organize files (e.g., 'avatars', 'logos')
   * @returns The relative path/key of the stored file
   */
  upload(file: Buffer, filename: string, folder: string): Promise<string>;

  /**
   * Delete a file from storage
   * @param filepath - The relative path/key returned by upload()
   */
  delete(filepath: string): Promise<void>;

  /**
   * Get the public URL/path for a stored file
   * @param filepath - The relative path/key returned by upload()
   * @returns Full URL or path that can be used to access the file
   */
  getUrl(filepath: string): string;
}
