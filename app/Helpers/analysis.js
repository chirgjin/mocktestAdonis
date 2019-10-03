module.exports = async (entity, user_test_id=null) => {
    const baseQuery = () => {
        const q = entity.answers()
        if(user_test_id) {
            return q.where('user_answers.user_test_id', user_test_id);
        }
        return q;
    }

    const stats = {
        answers : {
            incorrect : await baseQuery().where('user_answers.correct', false).whereNot('user_answers.answer', null).getCount(),
            correct : await baseQuery().where('user_answers.correct', true).getCount(),
            unattempted : await baseQuery().where('user_answers.answer', null).getCount(),
        },
        average_time : {
            incorrect : (await baseQuery().where('user_answers.correct', false).whereNot('user_answers.answer', null).avg('time_taken as avg_time'))[0].avg_time,
            correct : (await baseQuery().where('user_answers.correct', true).avg('time_taken as avg_time'))[0].avg_time,
            unattempted : (await baseQuery().where('user_answers.answer', null).avg('time_taken as avg_time'))[0].avg_time,
        },
        total_time : (await baseQuery().sum('time_taken as total_time'))[0].total_time,
    }

    return stats;
};