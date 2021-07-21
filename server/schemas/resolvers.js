const {User, Thought} = require ('../models');
const { AuthenticationError } = require ('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me : async (parent, args, context) => {
            if (context.user)
            {
                const userData = await User.findOne({ _id: context.user._id }) 
                .select('-__v -password')

                return userData;
            }
                 
            throw new AuthenticationError('Not logged in');
            
        },

    },
    Mutation : {
        addUser : async (parent, args) => {
            const user = User.create(args);
            const token = signToken(user);

            return {user, token};

        },

        login : async (parent, {email, password}) => {
            const user = await User.findOne({email});

            if(!user)
            {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if(!correctPw)
            {
                throw new AuthenticationError('Incorrect Credentials');
            }

            const token = signToken(user);

            return {user, token};

        },

        saveBook: async (parent, {input}, context) => {
            const book = {...input}
            if (context.user) {
                const user = context.user
                try {
                    const updatedUser = await User.findOneAndUpdate(
                      { _id: user._id },
                      { $addToSet: { savedBooks: book } },
                      { new: true, runValidators: true }
                    );

                    return updatedUser;

                } 
                catch (err) {

                    console.log(err);
                    return err;
                }
            }   

            throw new AuthenticationError('You need to be logged in!');
        },

        removeBook:  async (parent, {bookId}, context) => {
            if (context.user) {
                const user = context.user
                try {
                    const updatedUser = await User.findOneAndUpdate(
                      { _id: user._id },
                      { $pull: { savedBooks: { bookId } } },
                      { new: true, runValidators: true }
                    );

                    return updatedUser;

                } 
                catch (err) {
                    console.log(err);
                    return err;
                }
            }
          
            throw new AuthenticationError('You need to be logged in!');
           
        },
    }
}

module.exports = resolvers;