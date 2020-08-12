if [ "$TRAVIS_PULL_REQUEST" == "false" ] && [ "$TRAVIS_BRANCH" == "master" ]; 
then
    export ENABLE_RUN_ALL=true
fi
echo $ENABLE_RUN_ALL
