import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Home, Users, Wrench, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { defaultBrowsePath } from '../utils/browseUrls';

const InstallCard = () => {
    const sections = [
        // {
        //     id: 1,
        //     image: '/acinstallcycleimages.png',
        //     title: 'Simple Installation Process',
        //     subtitle: 'Easy Steps to Cool Comfort',
        //     description: 'Our streamlined installation process ensures your AC is up and running quickly. From selection to installation, we guide you through every step with professional expertise.',
        //     features: [
        //         'Quick booking and scheduling',
        //         'Professional installation team',
        //         'Quality assurance check',
        //         'Post-installation support'
        //     ],
        //     icon: Home,
        //     color: 'from-blue-500 to-blue-600',
        //     reverse: false,
        // },
        {
            id: 2,
            image: '/acforrent.png',
            title: 'Premium ACs for Rent',
            subtitle: 'Wide Selection Available',
            description: 'Choose from our extensive collection of premium air conditioners. All units are well-maintained, energy-efficient, and ready to provide you with ultimate comfort.',
            features: [
                'Top brands available',
                'Flexible rental plans',
                'Monthly, quarterly & yearly options',
                'Maintenance included'
            ],
            icon: CheckCircle,
            color: 'from-green-500 to-emerald-600',
            reverse: true,
        },
        {
            id: 3,
            image: '/familyhappyafteracinstall.png',
            title: 'Happy Families, Cool Homes',
            subtitle: 'Your Comfort is Our Success',
            description: 'Join thousands of satisfied families enjoying perfect climate control. Our reliable AC rental service brings comfort and happiness to your home.',
            features: [
                '1000+ happy customers',
                '24/7 customer support',
                'Satisfaction guaranteed',
                'Family-friendly service'
            ],
            icon: Users,
            color: 'from-purple-500 to-pink-600',
            reverse: false,
        },
        {
            id: 4,
            image: '/implementingac.png',
            title: 'Professional Installation',
            subtitle: 'Expert Technicians at Work',
            description: 'Our certified technicians ensure perfect installation every time. With years of experience, we handle everything from setup to final testing with precision.',
            features: [
                'Certified professionals',
                'Safe & secure installation',
                'Quality testing & inspection',
                'Warranty on installation'
            ],
            icon: Wrench,
            color: 'from-orange-500 to-red-600',
            reverse: true,
        },
    ];

    return (
        <section className="py-12 md:py-20 bg-gradient-to-b from-white via-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 md:mb-16"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-dark mb-4">
                        Your Journey to Cool Comfort
                    </h2>
                    <p className="text-lg md:text-xl text-text-light max-w-3xl mx-auto">
                        From selection to installation, we make the entire process seamless and stress-free
                    </p>
                </motion.div>

                {/* Sections */}
                <div className="space-y-16 md:space-y-24">
                    {sections.map((section, index) => {
                        const IconComponent = section.icon;
                        const isReverse = section.reverse;

                        return (
                            <motion.div
                                key={section.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className={`flex flex-col ${isReverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 md:gap-12`}
                            >
                                {/* Image Section */}
                                <div className={`w-full lg:w-1/2 ${isReverse ? 'lg:pl-8' : 'lg:pr-8'}`}>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ duration: 0.3 }}
                                        className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
                                    >
                                        <img
                                            src={section.image}
                                            alt={section.title}
                                            className="w-full h-auto object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                                    </motion.div>
                                </div>

                                {/* Content Section */}
                                <div className={`w-full lg:w-1/2 flex flex-col justify-center ${isReverse ? 'lg:pr-8' : 'lg:pl-8'}`}>
                                    <motion.div
                                        initial={{ opacity: 0, x: isReverse ? 30 : -30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        {/* Icon */}
                                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${section.color} mb-6 shadow-lg`}>
                                            <IconComponent className="w-8 h-8 text-white" />
                                        </div>

                                        {/* Subtitle */}
                                        <p className="text-sm md:text-base font-semibold text-primary-blue mb-2 uppercase tracking-wide">
                                            {section.subtitle}
                                        </p>

                                        {/* Title */}
                                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-dark mb-4">
                                            {section.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-base md:text-lg text-text-light mb-6 leading-relaxed">
                                            {section.description}
                                        </p>

                                        {/* Features List */}
                                        <ul className="space-y-3 mb-8">
                                            {section.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start">
                                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-text-dark font-medium">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* CTA Button */}
                                        {index === 0 && (
                                            <Link to={defaultBrowsePath()}>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-blue to-primary-blue-light text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                                >
                                                    <span>Browse ACs</span>
                                                    <ArrowRight className="w-5 h-5" />
                                                </motion.button>
                                            </Link>
                                        )}
                                        {index === 1 && (
                                            <Link to={defaultBrowsePath()}>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-blue to-primary-blue-light text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                                >
                                                    <span>View Rentals</span>
                                                    <ArrowRight className="w-5 h-5" />
                                                </motion.button>
                                            </Link>
                                        )}
                                        {index === 2 && (
                                            <Link to="/contact">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-blue to-primary-blue-light text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                                >
                                                    <span>Get Started</span>
                                                    <ArrowRight className="w-5 h-5" />
                                                </motion.button>
                                            </Link>
                                        )}
                                        {index === 3 && (
                                            <Link to="/service-request">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-blue to-primary-blue-light text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                                >
                                                    <span>Book Installation</span>
                                                    <ArrowRight className="w-5 h-5" />
                                                </motion.button>
                                            </Link>
                                        )}
                                    </motion.div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default InstallCard;
