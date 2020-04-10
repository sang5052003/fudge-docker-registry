export class ApiErrorInfo {
    public code: string;

    public message: string;

    public description?: string;

    public status: number;

    constructor(opts: {
        code: string,
        message: string,
        description?: string,
        status: number
    }) {
      this.code = opts.code;
      this.message = opts.message;
      this.description = opts.description;
      this.status = opts.status;
    }
}

export const BLOB_UNKNOWN: ApiErrorInfo = new ApiErrorInfo({
  code: 'BLOB_UNKNOWN',
  message: 'blob unknown to registry',
  description: 'This error may be returned when a blob is unknown to the registry in a specified repository. This can be returned with a standard get or if a manifest references an unknown layer during upload.',
  status: 400
});

export const BLOB_UPLOAD_INVALID: ApiErrorInfo = new ApiErrorInfo({
  code: 'BLOB_UPLOAD_INVALID',
  message: 'blob upload invalid',
  description: 'The blob upload encountered an error and can no longer proceed.',
  status: 404
});

export const BLOB_UPLOAD_UNKNOWN: ApiErrorInfo = new ApiErrorInfo({
  code: 'BLOB_UPLOAD_UNKNOWN',
  message: 'blob upload unknown to registry',
  description: 'If a blob upload has been cancelled or was never started, this error code may be returned.',
  status: 400
});

export const DIGEST_INVALID: ApiErrorInfo = new ApiErrorInfo({
  code: 'DIGEST_INVALID',
  message: 'provided digest did not match uploaded content',
  description: 'When a blob is uploaded, the registry will check that the content matches the digest provided by the client. The error may include a detail structure with the key “digest”, including the invalid digest string. This error may also be returned when a manifest includes an invalid layer digest.',
  status: 403
});

export const MANIFEST_BLOB_UNKNOWN: ApiErrorInfo = new ApiErrorInfo({
  code: 'MANIFEST_BLOB_UNKNOWN',
  message: 'blob unknown to registry',
  description: 'This error may be returned when a manifest blob is  unknown to the registry.',
  status: 400
});
export const MANIFEST_INVALID: ApiErrorInfo = new ApiErrorInfo({
  code: 'MANIFEST_INVALID',
  message: 'manifest invalid',
  description: 'During upload, manifests undergo several checks ensuring validity. If those checks fail, this error may be returned, unless a more specific error is included. The detail will contain information the failed validation.',
  status: 404
});

export const MANIFEST_UNKNOWN: ApiErrorInfo = new ApiErrorInfo({
  code: 'MANIFEST_UNKNOWN',
  message: 'manifest unknown',
  description: 'This error is returned when the manifest, identified by name and tag is unknown to the repository.',
  status: 400
});

export const MANIFEST_UNVERIFIED: ApiErrorInfo = new ApiErrorInfo({
  code: 'MANIFEST_UNVERIFIED',
  message: 'manifest failed signature verification',
  description: 'During manifest upload, if the manifest fails signature verification, this error will be returned.',
  status: 404
});

export const NAME_INVALID: ApiErrorInfo = new ApiErrorInfo({
  code: 'NAME_INVALID',
  message: 'invalid repository name',
  description: 'Invalid repository name encountered either during manifest validation or any API operation.',
  status: 404
});

export const NAME_UNKNOWN: ApiErrorInfo = new ApiErrorInfo({
  code: 'NAME_UNKNOWN',
  message: 'repository name not known to registry',
  description: 'This is returned if the name used during an operation is unknown to the registry.',
  status: 400
});

export const SIZE_INVALID: ApiErrorInfo = new ApiErrorInfo({
  code: 'SIZE_INVALID',
  message: 'provided length did not match content length',
  description: 'When a layer is uploaded, the provided size will be checked against the uploaded content. If they do not match, this error will be returned.',
  status: 404
});

export const TAG_INVALID: ApiErrorInfo = new ApiErrorInfo({
  code: 'TAG_INVALID',
  message: 'manifest tag did not match URI',
  description: 'During a manifest upload, if the tag in the manifest does not match the uri tag, this error will be returned.',
  status: 404
});

export const UNAUTHORIZED: ApiErrorInfo = new ApiErrorInfo({
  code: 'UNAUTHORIZED',
  message: 'authentication required',
  description: 'The access controller was unable to authenticate the client. Often this will be accompanied by a Www-Authenticate HTTP response header indicating how to authenticate.',
  status: 401
});

export const DENIED: ApiErrorInfo = new ApiErrorInfo({
  code: 'DENIED',
  message: 'requested access to the resource is denied',
  description: 'The access controller denied access for the operation on a resource.',
  status: 403
});

export const UNSUPPORTED: ApiErrorInfo = new ApiErrorInfo({
  code: 'UNSUPPORTED',
  message: 'The operation is unsupported.',
  description: 'The operation was unsupported due to a missing implementation or invalid set of parameters.',
  status: 400
});
