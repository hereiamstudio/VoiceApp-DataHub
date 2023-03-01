# **Authentication and access**

This section covers anything to do with a user’s account, from registration, login and their logged-in state. User accounts can only be created in the Data Hub by authorised users.

## **Account invites**

We restrict account creation to only privileged users. Accounts are created by way of an invite; they are only included and can access the Data Hub or App when they have completed their account details via their invite link.

This step ensures that the user has access to their email account registered with the account.

Users can also be invited by bulk via import of Excel or CSV.

## **Password criteria**

We ensure all passwords match a minimum specification. This includes standard requirements such as length and complexity.

## **PIN Access**

Once a user has set up their account on their Android device they will have to enter their PIN for any future sessions. The PIN is only stored on the device and only the user has access to it. PIN verification will be enforced when the App has been minimised or dismissed, when the phone has been locked or  turned off, or when the user has not used the app for a defined period of time (e.g. 15-30 minutes).

## **Idle timeout**

Once a user has logged-in to the Data Hub, their session will be time-restricted. After a defined period of time of no interaction 15 minutes, a user will be given a warning that they will be logged-out. If the user does not cancel this their session will be deleted and they will have to login again to gain access.

On the App, a user will not be logged-out but instead have to re-enter their PIN.

## **Access control**

We have specific access groups for users of the App and Data Hub. A user will always be able to have access to the actions designated to their group,  as well as actions of the levels below them. However, they will never be able to access an action for levels above them.

**The user groups will be:**

-   **Administrators** are able to perform all actions and access all data on the platform.
-   **Assessment Leads are only able to perform actions relating to their account, or accounts of the users they manage. They have access only to data for projects or users that they have been permitted to.**
-   **Enumerators** are only able to access the App. They have no access to the Data Hub.

# **High-risk data**

This section relates to all high-risk data on the platform. High-risk data is data that includes personally identifiable information about interviewees and enumerators.

## **Speech-to-Text**

VoiceApp’s App uses Google’s speech-to-text functionality to capture open response answers from respondents during an interview. As this is not an open source piece of software, the use of this product and the use of the data from the product will be managed via [Google’s terms of service and privacy policy,](https://policies.google.com/?hl=en-US) and in accordance with it’s policies on [data logging specifically for speech-to-text software](https://cloud.google.com/speech-to-text/docs/data-logging). Here I Am is not able to alter how the data is collected, stored or used.

By conducting some tests using Charles Proxy, we were able to determine the flow of data when using Google’s Speech-to-text software on the VoiceApp.

The following is based on research conducted in December 2020, and may be subject to change based on Google’s updates to the Speech-to-text software.

-   When the Speech-to-Text function is used, a connection is opened to the following (or a similar) endpoint: [https://speechs3proto2-pa.googleapis.com](https://speechs3proto2-pa.googleapis.com/)
-   The endpoint uses SSL to secure the transfer of data. The following is reported by Charles Proxy: TLSv1.2 TLS_AES_128_HCM_SHA256
-   The connection appears to be held open, which indicates that a new connection is not necessarily opened for each speech-to-text use, as it may use an existing connection if available.
-   If the connection is left idle the connection will expire / time out. During tests the connection expired 5 minutes after the final transfer.
-   Using a test paragraph of around 120 words, the average upload transfer size of the voice file was 60KB, and the average download was 20KB in size.
-   It is not possible to determine the contents of the transfer as the data is encrypted.

## **Encryption**

As well as the standard network encryption (TLS) we also add in extra layers of security where required. The primary example of this is the data for an interview. Before this is published from the App and sent to the Data Hub, we encrypt the data with end-to-end encryption, meaning the only time it can be decrypted will be on successful posting to the Data Hub.

## **Deletion of interview data**

We automatically erase data on the App once an interview has been completed. Once the data has been erased the App user will no longer be able to view the data; this will only be possible for authorised users on the Data Hub.

## **Confirmation of destructive actions**

The most common case of data loss or breaching is human error. We ensure that any action that results in deletion, modification or export of data will first require user confirmation. This includes context of the requested action and the ability to cancel or continue with it.

## **Safeguarding reporting**

We provide the necessary functionality to protect data where required, but we won’t have the context of the data. For this, we rely on users and provide functionality to allow Data Hub or App users to easily flag data or content that needs to be  reviewed for safeguarding or other issues.

## **Visual flags**

We will include visual flags for users whenever required. These flags are reminders and actions for users to take. For example, before exporting data in the Data Hub, a confirmation alert reminds a user of their responsibilities and what they must do to keep the data safe.

## Limited export of data

Users are encouraged to export the smallest footprint of data possible. By default, only limited fields are selected for export and a user must opt-in to additional fields they wish to export.

## Short-term storage of report data

When report data is generated, the raw data is stored in Firebase Storage as a JSON file. When a report is exported, the unique file type–such as Excel or CSV– are also stored as a file on Firebase Storage. Both files are created with short-term storage of 30 days (this is configured via sing Google Cloud Storage’s lifecycle settings).

# **Other**

## **Audit logging**

We log all actions in the Data Hub that are destructive or sensitive, such as viewing an interview response, deleting a user, or exporting data. The data recorded includes page information such as (type, ids, etc.), user ID, and date and time.

We use Google Analytics for page/screen and event tracking.

## **SSL**

All data sent over the network is encrypted and sent over a HTTPS connection.

## **CSP**

Content Security Policy (CSP) is an additional layer of security that can be added to websites. We have added CSP to the Data Hub to reduces risk of man-in-the-middle and cross site scripting attacks by limiting the domains and sources that a server can interact with.
