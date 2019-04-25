#!/usr/bin/env bash
set -e

echo "SSH_USERNAME             ${SSH_USERNAME}"
echo "SSH_HOST                 ${SSH_HOST}"
echo "MONGODB_USERNAME         ${MONGODB_USERNAME}"
echo "MONGODB_PASSWORD         ${MONGODB_PASSWORD}"
echo "MONGODB_DATABASE         ${MONGODB_DATABASE}"
echo "MONGODB_AUTH_DB          ${MONGODB_AUTH_DB}"
echo "-------------------------------------------------"

[ -z "$SSH_PRIVATE_KEY" ] || create_private_ssh_key_from_env

rm -rf /tmp/mongo-export/*
mkdir -p /tmp/mongo-export

declare -A collections
collections=(
  ["categories"]="_id,slug,title,icon,updatedAt,createdAt"
  ["badges"]="_id,image.path,image.alt,key,role,type,updatedAt,createdAt,status"
  ["users"]="_id,avatar,badgeIds,coverImg,createdAt,updatedAt,email,followerIds,follows,isVerified,language,lastActiveAt,name,password,resetExpires,resetShortToken,resetToken,role,slug,systemNotificationsSeen,termsAndConditionsAccepted,verifyChanges,verifyExpires,verifyExpires,verifyToken,wasInvited"
  ["contributions"]="_id,cando.difficulty,cando.reason,cando.reasonTitle,categoryIds,content,contentExcerpt,createdAt,updatedAt,deleted,hasMore,isEnabled,language,meta.hasVideo,organizationId,slug,tags,teaserImg,title,type,userId,visibility"
  ["comments"]="_id,createdAt,updatedAt,deleted,content,contentExcerpt,contributionId,hasMore,language,upvotes,userId"
  ["follows"]="_id,createdAt,updatedAt,foreignService,foreignId,userId"
  ["shouts"]="_id,createdAt,updatedAt,foreignId,foreignService,userId"
)

for collection in "${!collections[@]}"
do
   eval "mongoexport --host localhost -d ${MONGODB_DATABASE} --port 27018 --username ${MONGODB_USERNAME} --password ${MONGODB_PASSWORD} --authenticationDatabase ${MONGODB_AUTH_DB} --db ${MONGODB_DATABASE} --type=csv --fields ${collections[$collection]}  --collection $collection --out /tmp/mongo-export/$collection.csv"

done

