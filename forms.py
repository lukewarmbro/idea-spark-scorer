from flask_wtf import FlaskForm
from wtforms import TextAreaField, SubmitField
from wtforms.validators import DataRequired, Length

class IdeaValidationForm(FlaskForm):
    business_idea = TextAreaField(
        'Business Idea',
        validators=[
            DataRequired(message='Please enter your business idea.'),
            Length(min=10, max=2000, message='Your idea should be between 10 and 2000 characters.')
        ],
        render_kw={
            'placeholder': 'Describe your business or product idea in detail. Include what problem it solves, who your target customers are, and how it would work...',
            'rows': 6
        }
    )
    
    submit = SubmitField('Validate My Idea')
